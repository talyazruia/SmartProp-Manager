package com.example.SmartProp.controller;

import com.example.SmartProp.service.ElectricityService;
import com.example.SmartProp.service.VisionService;
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
            String base64Image = Base64.getEncoder().encodeToString(imageFile.getBytes());
            String extractedText = visionService.extractTextFromImage(base64Image);
            String cleanNumber = extractedText.replaceAll("[^0-9.]", "");

            if (cleanNumber.isEmpty() || cleanNumber.equals(".")) {
                return "לא הצלחנו לזהות את הספרות במונה. אנא העלה תמונה חדשה ברורה יותר.";
            }

            double currentReading = Double.parseDouble(cleanNumber);
            return electricityService.calculateAndSaveBill(username, currentReading, rate, updateRate, propertyId);

        } catch (Exception e) {
            return "אירעה שגיאה בתהליך הפענוח. וודא שהתמונה תקינה ונסה שוב.";
        }
    }
}