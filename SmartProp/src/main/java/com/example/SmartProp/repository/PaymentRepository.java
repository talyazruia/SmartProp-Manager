package com.example.SmartProp.repository;

import com.example.SmartProp.model.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {

    // מחזיר את כל היסטוריית התשלומים של שוכר מסוים
    List<Payment> findByTenantUsername(String tenantUsername);

    // מוצא את התשלום הכי עדכני של השוכר לפי ה-ID הכי גבוה (האחרון באמת שנכנס)
    Payment findFirstByTenantUsernameOrderByIdDesc(String tenantUsername);

    // מתודת נוחות חדשה: מחזיר את כל התשלומים של שוכר מסוים שעדיין מחכים לאישור המשכיר
    List<Payment> findByTenantUsernameAndIsApprovedFalse(String tenantUsername);
}