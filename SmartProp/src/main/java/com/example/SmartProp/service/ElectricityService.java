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
    private PaymentRepository paymentRepository;

    public String calculateAndSaveBill(String tenantUsername, double current, double rate, boolean updateRate, Long propertyId) {
        double rateToUse;

        // 1. ניהול התעריף
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
                rateToUse = 0.6;
                saveDefaultRate(0.6);
            }
        }

        // 2. שליפת הקריאה האחרונה מהDB
        Payment lastPayment = paymentRepository.findFirstByTenantUsernameOrderByDateDesc(tenantUsername);
        double previous = (lastPayment != null) ? lastPayment.getMeterReading() : 0;

        // 3. החישוב
        double consumption = current - previous;
        double totalCost = consumption * rateToUse;

        // 4. שמירת התשלום
        Payment payment = new Payment();
        payment.setTenantUsername(tenantUsername);
        payment.setMeterReading(current);
        payment.setAmount(totalCost);
        payment.setDate(LocalDate.now());
        payment.setPropertyId(propertyId);
        paymentRepository.save(payment);

        // 5. בניית ההודעה
        String message = String.format(
            "קריאה קודמת: %.0f | קריאה נוכחית: %.0f | צריכה: %.0f קוט\"ש | תעריף: %.2f | סה\"כ לתשלום: %.2f ש\"ח",
            previous, current, consumption, rateToUse, totalCost
        );
        return message;
    }

    private void saveDefaultRate(double value) {
        SystemSettings defaultSetting = new SystemSettings();
        defaultSetting.setSettingKey("electricity_rate");
        defaultSetting.setSettingValue(value);
        settingsRepository.save(defaultSetting);
    }
}