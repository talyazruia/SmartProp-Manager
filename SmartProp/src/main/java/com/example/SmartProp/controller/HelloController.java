package com.example.SmartProp.controller;

import com.example.SmartProp.model.SystemSettings;
import com.example.SmartProp.repository.SettingsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import java.util.Optional;

@RestController
public class HelloController {

    @Autowired
    private SettingsRepository settingsRepository;

    @GetMapping("/api/calculate")
    public String calculateAndSave(
            @RequestParam double current, 
            @RequestParam double previous, 
            @RequestParam(required = false, defaultValue = "0") double rate,
            @RequestParam boolean updateRate) {
        
        double rateToUse = rate;

        // 1. אם המשתמש רוצה לעדכן - נשמור את ה-rate החדש
        if (updateRate) {
            SystemSettings electricitySetting = new SystemSettings();
            electricitySetting.setSettingKey("electricity_rate");
            electricitySetting.setSettingValue(rate);
            settingsRepository.save(electricitySetting);
            rateToUse = rate;
        } 
        // 2. אם הוא לא רוצה לעדכן - ננסה למשוך מה-DB
        else {
            Optional<SystemSettings> savedSetting = settingsRepository.findById("electricity_rate");
            
            if (savedSetting.isPresent()) {
                rateToUse = savedSetting.get().getSettingValue();
            } else {
                rateToUse = 0.6; // דיפולט
                SystemSettings defaultSetting = new SystemSettings();
                defaultSetting.setSettingKey("electricity_rate");
                defaultSetting.setSettingValue(0.6);
                settingsRepository.save(defaultSetting);
            }
        } // <--- כאן נגמר ה-else

        // 3. חישוב סופי (עכשיו זה בתוך הפונקציה!)
        double consumption = current - previous;
        double totalCost = consumption * rateToUse;

        String message = String.format("צריכה: %.2f קוט\"ש. מחיר ליחידה: %.2f ש\"ח. סה\"כ: %.2f ש\"ח.", 
                                        consumption, rateToUse, totalCost);
        
        if (updateRate) {
            message += " (המחיר עודכן בבסיס הנתונים)";
        } else {
            message += " (החישוב בוצע לפי המחיר השמור במערכת)";
        }
        
        return message;
    } // <--- כאן נגמרת הפונקציה
} // <--- כאן נגמר ה-Class