package com.example.SmartProp.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import java.time.LocalDate;

@Entity
public class Payment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String tenantUsername;
    private double meterReading; // ודאי שהשם כתוב בדיוק ככה
    private double amount;
    private LocalDate date;
    private boolean isPaid;

    // הגטר והסטר שחסרים לך כנראה:
    public double getMeterReading() {
        return meterReading;
    }

    public void setMeterReading(double meterReading) {
        this.meterReading = meterReading;
    }

    // שאר הגטרים והסטרים (חשוב שיהיו כולם)
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTenantUsername() { return tenantUsername; }
    public void setTenantUsername(String tenantUsername) { this.tenantUsername = tenantUsername; }

    public double getAmount() { return amount; }
    public void setAmount(double totalAmount) { this.amount = totalAmount; }

    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }

    public boolean isPaid() { return isPaid; }
    public void setPaid(boolean paid) { isPaid = paid; }
}