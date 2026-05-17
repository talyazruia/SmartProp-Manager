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
    private double meterReading; 
    private double amount;
    private LocalDate date;
    
    // השדה החדש: סטטוס אישור התשלום על ידי המשכיר
    private boolean isApproved = false; 

    // גטרים וסטרים לשדה החדש
    public boolean isApproved() {
        return isApproved;
    }

    public void setApproved(boolean approved) {
        isApproved = approved;
    }

    // גטרים וסטרים לשאר השדות
    public double getMeterReading() {
        return meterReading;
    }

    public void setMeterReading(double meterReading) {
        this.meterReading = meterReading;
    }

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
}