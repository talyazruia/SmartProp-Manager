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
    private LandlordRepository landlordRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    public String calculateAndSaveBill(
            String tenantUsername,
            double current,
            double rate,
            boolean updateRate,
            Long propertyId
    ) {
        double rateToUse = 0.6; // ברירת מחדל לגיבוי

        // 1. שליפת השוכר מהדאטהבייס כדי למצוא מי המשכיר שלו
        Optional<Tenant> tenantOptional = tenantRepository.findById(tenantUsername);

        if (tenantOptional.isPresent()) {
            Tenant tenant = tenantOptional.get();

            // שליפת המשכיר המשויך לשוכר זה
            String landlordUsername = tenant.getLandlordId();
            
            if (landlordUsername != null) {
                Optional<Landlord> landlordOptional = landlordRepository.findById(landlordUsername);

                if (landlordOptional.isPresent()) {
                    Landlord landlord = landlordOptional.get();

                    if (updateRate) {
                        // אם ביקשו לעדכן תעריף, נעדכן אותו אצל המשכיר
                        landlord.setElectricityRate(rate);
                        landlordRepository.save(landlord);
                        rateToUse = rate;
                    } else {
                        // אחרת נשתמש בתעריף ששמור אצל המשכיר
                        rateToUse = landlord.getElectricityRate();

                        // הגנה למקרה שהתעריף עדיין לא הוגדר
                        if (rateToUse <= 0) {
                            rateToUse = 0.6;
                        }
                    }
                }
            }
        }

        // 2. תוקן: שליפת הקריאה האחרונה מה-DB לפי הנכס (propertyId) ולא לפי השוכר
        double previous = 0;
        if (propertyId != null) {
            Payment lastPayment = paymentRepository.findFirstByPropertyIdOrderByIdDesc(propertyId);
            if (lastPayment != null) {
                previous = lastPayment.getMeterReading();
            }
        }

        // 3. חישוב צריכת החשמל
        double consumption = current - previous;

        // אם הקריאה החדשה קטנה מהקודמת, לא נשמור תשלום שגוי
        if (consumption < 0) {
            return String.format(
                    "שגיאה: קריאת המונה החדשה %.2f נמוכה מהקריאה הקודמת %.2f. אנא בדקו את הקריאה ונסו שוב.",
                    current,
                    previous
            );
        }

        // 4. חישוב עלות התשלום
        double totalCost = consumption * rateToUse;

        // 5. שמירת התשלום החדש במסד הנתונים
        Payment payment = new Payment();
        payment.setTenantUsername(tenantUsername);
        payment.setMeterReading(current);
        payment.setConsumptionKwh(consumption);
        payment.setAmount(totalCost);
        payment.setDate(LocalDate.now());
        payment.setPropertyId(propertyId);

        // ברירת מחדל: התשלום מחכה לאישור המשכיר
        payment.setApproved(false);

        paymentRepository.save(payment);

        // 6. בניית ההודעה החוזרת לפרונט
        return String.format(
                "קריאה קודמת: %.2f | קריאה נוכחית: %.2f | צריכה: %.2f קוט\"ש | תעריף משכיר: %.2f | סה\"כ לתשלום: %.2f ש\"ח",
                previous,
                current,
                consumption,
                rateToUse,
                totalCost
        );
    }

    // תוקן: פונקציית העזר עבור ה-Vision תלויה כעת ב-propertyId
    public double getPreviousReadingForProperty(Long propertyId) {
        if (propertyId == null) {
            return 0;
        }
        Payment lastPayment = paymentRepository.findFirstByPropertyIdOrderByIdDesc(propertyId);
        return (lastPayment != null) ? lastPayment.getMeterReading() : 0;
    }
}