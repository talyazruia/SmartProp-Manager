package com.example.SmartProp.controller;

import com.example.SmartProp.model.Payment;
import com.example.SmartProp.repository.PaymentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController 
@RequestMapping("/api/payments") 
@CrossOrigin(origins = "*") // שינינו ל-* כדי למנוע בעיות CORS מול כל פורט של React (8081 או 3000)
public class PaymentController {

    @Autowired 
    private PaymentRepository paymentRepository;

    // 1. שליפת היסטוריית תשלומים מלאה לפי ID של דירה
    @GetMapping("/property/{propertyId}")
    public List<Payment> getPaymentsByProperty(@PathVariable Long propertyId) {
        return paymentRepository.findByPropertyId(propertyId);
    }

    // 2. חדש: שליפת תשלומים שממתינים לאישור המשכיר (כאשר isApproved הוא false)
    @GetMapping("/pending/{propertyId}")
    public List<Payment> getPendingPayments(@PathVariable Long propertyId) {
        return paymentRepository.findByPropertyIdAndIsApproved(propertyId, false);
    }

    // 3. חדש: פונקציית האישור - משנה את הסטטוס מ-0 ל-1 (true)
    @PutMapping("/{paymentId}/approve")
    public ResponseEntity<?> approvePayment(@PathVariable Long paymentId) {
        return paymentRepository.findById(paymentId)
                .map(payment -> {
                    payment.setApproved(true); // הופך את ה-isApproved ל-true (כלומר 1 במסד הנתונים)
                    paymentRepository.save(payment);
                    return ResponseEntity.ok(payment);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // 4. חדש: יצירת רשומת תשלום חדשה (כשהשוכר שולח קריאה ידנית או מתמונה)
    @PostMapping("/create")
    public Payment createPayment(@RequestBody Payment payment) {
        if (payment.getDate() == null) {
            payment.setDate(LocalDate.now());
        }
        payment.setApproved(false); // ברירת מחדל: ממתין לאישור (0)
        return paymentRepository.save(payment);
    }
}