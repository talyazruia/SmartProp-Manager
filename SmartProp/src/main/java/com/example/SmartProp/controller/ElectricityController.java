package com.example.SmartProp.controller;

import com.example.SmartProp.model.Landlord;
import com.example.SmartProp.repository.LandlordRepository;
import com.example.SmartProp.repository.PaymentRepository;
import com.example.SmartProp.service.ElectricityService;
import com.example.SmartProp.service.VisionService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Base64;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/electricity")
@CrossOrigin(origins = "*") // שונה ל-* כדי למנוע בעיות CORS מול השרת
public class ElectricityController {

    @Autowired
    private ElectricityService electricityService;

    @Autowired
    private VisionService visionService;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private LandlordRepository landlordRepository;


    // ============================
    // חישוב רגיל - מתוקן למניעת שמירה מוקדמת
    // ============================
    @GetMapping("/calculate")
    public String calculate(
            @RequestParam String username,
            @RequestParam double current,
            @RequestParam(required = false, defaultValue = "0") double rate,
            @RequestParam boolean updateRate,
            @RequestParam(required = false) Long propertyId) {

        // אם updateRate הוא false, אנחנו לא רוצים לשמור ב-DB! 
        // נבדוק אם הסרוויס תומך בחישוב בלבד או נבצע מניפולציה בהתאם
        if (!updateRate) {
            // שליפת הקריאה הקודמת לצורך הצגת החישוב בלבד למשתמש בטקסט
            double previousReading = electricityService.getPreviousReadingForProperty(propertyId);
            double consumption = current - previousReading;
            if (consumption < 0) consumption = 0;
            
            // שליפת מחיר הקילואט של המשכיר אם לא נשלח rate
            double currentRate = rate;
            if (currentRate == 0) {
                Optional<Landlord> landlord = landlordRepository.findById(username);
                currentRate = landlord.map(Landlord::getElectricityRate).orElse(0.6);
            }
            
            double totalCost = consumption * currentRate;
            
            // מחזירים טקסט זמני ל-React מבלי לקרוא ל-calculateAndSaveBill (ששומר במסד הנתונים)
            return String.format("קריאה נוכחית: %.1f | קריאה קודמת: %.1f | צריכה: %.1f קו\"ש | מחיר לקו\"ש: %.2f ₪ | סכום לתשלום: %.2f ₪", 
                    current, previousReading, consumption, currentRate, totalCost);
        }

        // רק אם updateRate הוא true (למשל במנגנונים ישנים שרוצים שמירה ישירה)
        return electricityService.calculateAndSaveBill(username, current, rate, updateRate, propertyId);
    }


    // ============================
    // חישוב מתוך תמונה - מתוקן למניעת שמירה מוקדמת
    // ============================
    @PostMapping("/calculate-from-image")
    public String calculateFromImage(
            @RequestParam String username,
            @RequestParam(required = false, defaultValue = "0") double rate,
            @RequestParam boolean updateRate,
            @RequestParam(required = false) Long propertyId,
            @RequestParam("image") MultipartFile imageFile) {

        try {
            double previousReading = electricityService.getPreviousReadingForProperty(propertyId);
            String base64Image = Base64.getEncoder().encodeToString(imageFile.getBytes());
            String extractedText = visionService.extractTextFromImage(base64Image, previousReading);

            if (extractedText == null || extractedText.isEmpty() || extractedText.equals(".")) {
                return "לא הצלחנו לזהות את הספרות במונה. אנא העלה תמונה חדשה ברורה יותר.";
            }

            double currentReading = Double.parseDouble(extractedText);

            if (!extractedText.contains(".")) {
                currentReading = currentReading / 10.0;
            }

            // התיקון הקריטי למניעת התראה מוקדמת בתמונות:
            if (!updateRate) {
                double consumption = currentReading - previousReading;
                if (consumption < 0) consumption = 0;
                
                double currentRate = rate;
                if (currentRate == 0) {
                    Optional<Landlord> landlord = landlordRepository.findById(username);
                    currentRate = landlord.map(Landlord::getElectricityRate).orElse(0.6);
                }
                
                double totalCost = consumption * currentRate;
                
                return String.format("קריאה נוכחית: %.1f | קריאה קודמת: %.1f | צריכה: %.1f קו\"ש | מחיר לקו\"ש: %.2f ₪ | סכום לתשלום: %.2f ₪", 
                        currentReading, previousReading, consumption, currentRate, totalCost);
            }

            return electricityService.calculateAndSaveBill(username, currentReading, rate, updateRate, propertyId);

        } catch (Exception e) {
            return "אירעה שגיאה בתהליך הפענוח. וודא שהתמונה תקינה ונסה שוב.";
        }
    }


    @GetMapping("/price/{username}")
    public Map<String, Object> getElectricityPrice(@PathVariable String username) {
        Optional<Landlord> landlord = landlordRepository.findById(username);
        double rate = landlord.map(Landlord::getElectricityRate).orElse(0.6);
        return Map.of("settingValue", rate);
    }

    @PutMapping("/price/{username}")
    public Map<String, String> updateElectricityPrice(
            @PathVariable String username,
            @RequestBody Map<String, Object> body) {
        try {
            double newRate = Double.parseDouble(body.get("settingValue").toString());
            Optional<Landlord> landlordOptional = landlordRepository.findById(username);
            if (landlordOptional.isPresent()) {
                Landlord landlord = landlordOptional.get();
                landlord.setElectricityRate(newRate);
                landlordRepository.save(landlord);
                return Map.of("status", "success", "message", "מחיר החשמל עודכן בהצלחה");
            } else {
                return Map.of("status", "error", "message", "משכיר לא נמצא");
            }
        } catch (Exception e) {
            return Map.of("status", "error", "message", "שגיאה בעדכון: " + e.getMessage());
        }
    }


    @PutMapping("/approve/{id}")
    public String approvePayment(@PathVariable Long id) {
        return paymentRepository.findById(id).map(payment -> {
            payment.setApproved(true);
            paymentRepository.save(payment);
            return "התשלום אושר בהצלחה על ידי המשכיר!";
        }).orElse("שגיאה: לא נמצא תשלום עם ה-ID שצוין.");
    }
}