package com.example.SmartProp.controller;

import com.example.SmartProp.model.Payment;
import com.example.SmartProp.repository.PaymentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController // חובה - מגדיר שזהו רכיב שמקבל בקשות HTTP
@RequestMapping("/api/payments") // חובה - מגדיר שכל הנתיבים כאן יתחילו ב-api/payments
@CrossOrigin(origins = "http://localhost:3000") // חובה - מאפשר ל-React (פורט 3000) לגשת ל-API (פורט 8081)
public class PaymentController {

    @Autowired // חובה - מזריק את ה-Repository כדי שנוכל להשתמש בפונקציות שלו
    private PaymentRepository paymentRepository;

    // שליפת היסטוריה לפי ID של דירה
    @GetMapping("/property/{propertyId}")
    public List<Payment> getPaymentsByProperty(@PathVariable Long propertyId) {
        return paymentRepository.findByPropertyId(propertyId);
    }
}