package com.example.SmartProp.repository;

import com.example.SmartProp.model.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    // מאפשר למצוא היסטוריה לפי שוכר ודירה כפי שביקשת
    List<Payment> findByTenantUsernameAndPropertyId(String tenantUsername, Long propertyId);
    List<Payment> findByTenantUsername(String tenantUsername);
}

