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
@CrossOrigin(origins = "http://localhost:3000")
public class ElectricityController {

    @Autowired
    private ElectricityService electricityService;

    @Autowired
    private VisionService visionService;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private LandlordRepository landlordRepository;

    @GetMapping("/calculate")
    public String calculate(
            @RequestParam String username,
            @RequestParam double current,
            @RequestParam(required = false, defaultValue = "0") double rate,
            @RequestParam boolean updateRate,
            @RequestParam(required = false) Long propertyId) {

        return electricityService.calculateAndSaveBill(username, current, rate, updateRate, propertyId);
    }

    @PostMapping("/calculate-from-image")
    public String calculateFromImage(
            @RequestParam String username,
            @RequestParam(required = false, defaultValue = "0") double rate,
            @RequestParam boolean updateRate,
            @RequestParam(required = false) Long propertyId,
            @RequestParam("image") MultipartFile imageFile) {

        try {
            double previousReading = electricityService.getPreviousReadingForTenant(username);

            String base64Image = Base64.getEncoder().encodeToString(imageFile.getBytes());

            String extractedText = visionService.extractTextFromImage(base64Image, previousReading);

            if (extractedText == null || extractedText.isEmpty() || extractedText.equals(".")) {
                return "לא הצלחנו לזהות את הספרות במונה. אנא העלה תמונה חדשה ברורה יותר.";
            }

            double currentReading = Double.parseDouble(extractedText);

            if (!extractedText.contains(".")) {
                currentReading = currentReading / 10.0;
            }

            return electricityService.calculateAndSaveBill(username, currentReading, rate, updateRate, propertyId);

        } catch (Exception e) {
            return "אירעה שגיאה בתהליך הפענוח. וודא שהתמונה תקינה ונסה שוב.";
        }
    }

    // *** ENDPOINTS חדשים לניהול מחיר החשמל לפי משכיר ***

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

    // אישור תשלום על ידי המשכיר
    @PutMapping("/approve/{id}")
    public String approvePayment(@PathVariable Long id) {
        return paymentRepository.findById(id).map(payment -> {
            payment.setApproved(true);
            paymentRepository.save(payment);
            return "התשלום אושר בהצלחה על ידי המשכיר!";
        }).orElse("שגיאה: לא נמצא תשלום עם ה-ID שצוין.");
    }
}
