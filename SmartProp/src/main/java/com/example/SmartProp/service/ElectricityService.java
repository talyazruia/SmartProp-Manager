package com.example.SmartProp.service;

import com.example.SmartProp.model.Payment;
import com.example.SmartProp.model.Tenant;
import com.example.SmartProp.model.Landlord;
import com.example.SmartProp.repository.PaymentRepository;
import com.example.SmartProp.repository.TenantRepository;
import com.example.SmartProp.repository.LandlordRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.util.Optional;

@Service
public class ElectricityService {

    @Autowired
    private TenantRepository tenantRepository;

    @Autowired
    private LandlordRepository landlordRepository; // הזרקת ה-Repository של המשכירים

    @Autowired
    private PaymentRepository paymentRepository;

    public String calculateAndSaveBill(String tenantUsername, double current, double rate, boolean updateRate, Long propertyId) {
        double rateToUse = 0.6; // ברירת מחדל לגיבוי

        // 1. שליפת השוכר מהדאטהבייס כדי למצוא מי המשכיר שלו
        Optional<Tenant> tenantOptional = tenantRepository.findById(tenantUsername);
        
        if (tenantOptional.isPresent()) {
            Tenant tenant = tenantOptional.get();
            
            // שליפת המשכיר המשויך לשוכר זה (לפי שדה ה-landlordId שמוגדר אצלכן בטבלת השוכר)
            String landlordUsername = tenant.getLandlordId(); 
            Optional<Landlord> landlordOptional = landlordRepository.findById(landlordUsername);
            
            if (landlordOptional.isPresent()) {
                Landlord landlord = landlordOptional.get();
                
                if (updateRate) {
                    // אם המשכיר ביקש לעדכן, נעדכן את התעריף ישירות ברשומת המשכיר הזה
                    landlord.setElectricityRate(rate);
                    landlordRepository.save(landlord);
                    rateToUse = rate;
                } else {
                    // אם לא מעדכנים, נשתמש בתעריף הקיים ששמור אצל המשכיר הספציפי הזה
                    rateToUse = landlord.getElectricityRate();
                }
            }
        }

        // 2. שליפת הקריאה האחרונה מה-DB (לפי מזהה ID יורד)
        Payment lastPayment = paymentRepository.findFirstByTenantUsernameOrderByIdDesc(tenantUsername);
        double previous = (lastPayment != null) ? lastPayment.getMeterReading() : 0;

        // 3. החישוב הפיננסי
        double consumption = current - previous;
        double totalCost = consumption * rateToUse;

        // 4. שמירת התשלום החדש
        Payment payment = new Payment();
        payment.setTenantUsername(tenantUsername);
        payment.setMeterReading(current);
        payment.setAmount(totalCost);
        payment.setDate(LocalDate.now());
        payment.setPropertyId(propertyId);
        paymentRepository.save(payment);

        // 5. בניית ההודעה החוזרת
        String message = String.format(
        "קריאה קודמת: %.2f | קריאה נוכחית: %.2f | צריכה: %.2f קוט\"ש | תעריף משכיר: %.2f | סה\"כ לתשלום: %.2f ש\"ח",
        previous, current, consumption, rateToUse, totalCost
        );
        return message;
    }

    public double getPreviousReadingForTenant(String tenantUsername) {
        Payment lastPayment = paymentRepository.findFirstByTenantUsernameOrderByIdDesc(tenantUsername);
        return (lastPayment != null) ? lastPayment.getMeterReading() : 0;
    }
}