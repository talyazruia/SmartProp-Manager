package com.example.SmartProp.controller;

import com.example.SmartProp.service.ElectricityService;
import com.example.SmartProp.service.VisionService;
import com.example.SmartProp.repository.PaymentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.Base64;

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
            // 1. שליפת הקריאה הקודמת מה-Database לפי מזהה ID יורד
            double previousReading = electricityService.getPreviousReadingForTenant(username);

            // 2. המרת התמונה ל-Base64
            String base64Image = Base64.getEncoder().encodeToString(imageFile.getBytes());
            
            // 3. שליחת התמונה ל-VisionService
            String extractedText = visionService.extractTextFromImage(base64Image, previousReading);

            // 4. בדיקה אם ה-API חילץ מועמד תקין
            if (extractedText == null || extractedText.isEmpty() || extractedText.equals(".")) {
                return "לא הצלחנו לזהות את הספרות במונה. אנא העלה תמונה חדשה ברורה יותר.";
            }

            // 5. המרה ל-double תוך בדיקה דינמית של סוג המונה (מכני/דיגיטלי)
            double currentReading = Double.parseDouble(extractedText);

            if (!extractedText.contains(".")) {
                currentReading = currentReading / 10.0;
            }

            // 6. הרצת לוגיקת החישוב והשמירה
            return electricityService.calculateAndSaveBill(username, currentReading, rate, updateRate, propertyId);

        } catch (Exception e) {
            return "אירעה שגיאה בתהליך הפענוח. וודא שהתמונה תקינה ונסה שוב.";
        }
    }

    // ה-Endpoint החדש: מאפשר למשכיר לאשר תשלום ספציפי לפי ה-ID שלו
    @PutMapping("/approve/{id}")
    public String approvePayment(@PathVariable Long id) {
        return paymentRepository.findById(id).map(payment -> {
            payment.setApproved(true);
            paymentRepository.save(payment);
            return "התשלום אושר בהצלחה על ידי המשכיר!";
        }).orElse("שגיאה: לא נמצא תשלום עם ה-ID שצוין.");
    }
}