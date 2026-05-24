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

    private Long propertyId;
    private String tenantUsername;

    // קריאת המונה הנוכחית כפי שהשוכר הזין / כפי שזוהתה מהתמונה
    private double meterReading;

    // הצריכה בפועל בקוט"ש:
    // קריאת מונה נוכחית פחות קריאת מונה קודמת
    private double consumptionKwh;

    // עלות התשלום בש"ח
    private double amount;

    private LocalDate date;

    // סטטוס אישור התשלום על ידי המשכיר
    private boolean isApproved = false;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getPropertyId() {
        return propertyId;
    }

    public void setPropertyId(Long propertyId) {
        this.propertyId = propertyId;
    }

    public String getTenantUsername() {
        return tenantUsername;
    }

    public void setTenantUsername(String tenantUsername) {
        this.tenantUsername = tenantUsername;
    }

    public double getMeterReading() {
        return meterReading;
    }

    public void setMeterReading(double meterReading) {
        this.meterReading = meterReading;
    }

    public double getConsumptionKwh() {
        return consumptionKwh;
    }

    public void setConsumptionKwh(double consumptionKwh) {
        this.consumptionKwh = consumptionKwh;
    }

    public double getAmount() {
        return amount;
    }

    public void setAmount(double totalAmount) {
        this.amount = totalAmount;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public boolean isApproved() {
        return isApproved;
    }

    public void setApproved(boolean approved) {
        isApproved = approved;
    }
}