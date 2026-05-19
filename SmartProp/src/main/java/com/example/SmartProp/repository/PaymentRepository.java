package com.example.SmartProp.repository;

import com.example.SmartProp.model.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PaymentRepository extends JpaRepository<Payment, Long> {

    // מחזיר את כל היסטוריית התשלומים של שוכר מסוים
    List<Payment> findByTenantUsername(String tenantUsername);

    List<Payment> findByPropertyId(Long propertyId);

    // מוצא את התשלום הכי עדכני של השוכר (שימושי כדי למשוך את הקריאה הקודמת)
    Payment findFirstByTenantUsernameOrderByDateDesc(String tenantUsername);
}
