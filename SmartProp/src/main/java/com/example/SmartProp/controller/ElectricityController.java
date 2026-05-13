package com.example.SmartProp.controller;

import com.example.SmartProp.model.SystemSettings;
import com.example.SmartProp.repository.SettingsRepository;
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

    private static final String ELECTRICITY_KEY = "ELECTRICITY_PRICE";

    @Autowired
    private ElectricityService electricityService;

    @Autowired
    private VisionService visionService;

    @Autowired
    private SettingsRepository settingsRepository;


    // ============================
    // קבלת מחיר החשמל הנוכחי
    // ============================
    @GetMapping("/price")
    public SystemSettings getElectricityPrice() {

        return settingsRepository
                .findById(ELECTRICITY_KEY)
                .orElseGet(() -> {

                    SystemSettings defaultSetting = new SystemSettings();

                    defaultSetting.setSettingKey(ELECTRICITY_KEY);
                    defaultSetting.setSettingValue(0.0);

                    return settingsRepository.save(defaultSetting);
                });
    }


    // ============================
    // עדכון מחיר החשמל
    // ============================
    @PutMapping("/price")
    public SystemSettings updateElectricityPrice(
            @RequestBody SystemSettings request) {

        SystemSettings setting = settingsRepository
                .findById(ELECTRICITY_KEY)
                .orElse(new SystemSettings());

        setting.setSettingKey(ELECTRICITY_KEY);
        setting.setSettingValue(request.getSettingValue());

        return settingsRepository.save(setting);
    }


    // ============================
    // חישוב רגיל
    // ============================
    @GetMapping("/calculate")
    public String calculate(
            @RequestParam String username,
            @RequestParam double current,
            @RequestParam(required = false, defaultValue = "0") double rate,
            @RequestParam boolean updateRate,
            @RequestParam(required = false) Long propertyId) {

        return electricityService.calculateAndSaveBill(
                username,
                current,
                rate,
                updateRate,
                propertyId
        );
    }


    // ============================
    // חישוב מתוך תמונה
    // ============================
    @PostMapping("/calculate-from-image")
    public String calculateFromImage(
            @RequestParam String username,
            @RequestParam(required = false, defaultValue = "0") double rate,
            @RequestParam boolean updateRate,
            @RequestParam(required = false) Long propertyId,
            @RequestParam("image") MultipartFile imageFile) {

        try {

            String base64Image = Base64
                    .getEncoder()
                    .encodeToString(imageFile.getBytes());

            String extractedText =
                    visionService.extractTextFromImage(base64Image);

            String cleanNumber =
                    extractedText.replaceAll("[^0-9.]", "");

            if (cleanNumber.isEmpty() || cleanNumber.equals(".")) {
                return "לא הצלחנו לזהות את הספרות במונה. אנא העלה תמונה חדשה ברורה יותר.";
            }

            double currentReading =
                    Double.parseDouble(cleanNumber);

            return electricityService.calculateAndSaveBill(
                    username,
                    currentReading,
                    rate,
                    updateRate,
                    propertyId
            );

        } catch (Exception e) {
            return "אירעה שגיאה בתהליך הפענוח. וודא שהתמונה תקינה ונסה שוב.";
        }
    }
}