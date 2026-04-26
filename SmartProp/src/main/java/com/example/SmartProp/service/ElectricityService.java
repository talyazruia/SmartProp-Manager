package com.example.SmartProp.service;

import com.example.SmartProp.model.Payment;
import com.example.SmartProp.model.SystemSettings;
import com.example.SmartProp.repository.PaymentRepository;
import com.example.SmartProp.repository.SettingsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.util.Optional;

@Service
public class ElectricityService {

    @Autowired
    private SettingsRepository settingsRepository;

    @Autowired
    private PaymentRepository paymentRepository; // הוספנו את הגישה לטבלת התשלומים

    public String calculateAndSaveBill(String tenantUsername, double current, double previous, double rate, boolean updateRate) {
        double rateToUse;

        // 1. ניהול התעריף (מול טבלת settings)
        if (updateRate) {
            SystemSettings electricitySetting = new SystemSettings();
            electricitySetting.setSettingKey("electricity_rate");
            electricitySetting.setSettingValue(rate);
            settingsRepository.save(electricitySetting);
            rateToUse = rate;
        } else {
            Optional<SystemSettings> savedSetting = settingsRepository.findById("electricity_rate");
            if (savedSetting.isPresent()) {
                rateToUse = savedSetting.get().getSettingValue();
            } else {
                rateToUse = 0.6; // דיפולט
                saveDefaultRate(0.6);
            }
        }

        // 2. החישוב המתמטי
        double consumption = current - previous;
        double totalCost = consumption * rateToUse;

        // 3. שמירת היסטוריית התשלום (מול טבלת payments)
        Payment payment = new Payment();
        payment.setTenantUsername(tenantUsername);
        payment.setMeterReading(current);
        payment.setAmount(totalCost);
        payment.setDate(LocalDate.now());
        payment.setPaid(false); // כברירת מחדל, החשבון עוד לא שולם
        paymentRepository.save(payment);

        // 4. בניית ההודעה שתחזור לפרונט
        String message = String.format("צריכה: %.2f קוט\"ש. מחיר: %.2f ש\"ח. סה\"כ לתשלום: %.2f ש\"ח.", 
                                        consumption, rateToUse, totalCost);
        
        message += " (החשבון נשמר בהיסטוריית התשלומים)";
        return message;
    }

    private void saveDefaultRate(double value) {
        SystemSettings defaultSetting = new SystemSettings();
        defaultSetting.setSettingKey("electricity_rate");
        defaultSetting.setSettingValue(value);
        settingsRepository.save(defaultSetting);
    }
}