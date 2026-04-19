package com.example.SmartProp.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

@Entity
public class Property {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; // מזהה אוטומטי
    private String address;
    private String landlordUsername; // מקשר למשכיר
    private double rentAmount;

    public Property() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    public String getLandlordUsername() { return landlordUsername; }
    public void setLandlordUsername(String landlordUsername) { this.landlordUsername = landlordUsername; }
    public double getRentAmount() { return rentAmount; }
    public void setRentAmount(double rentAmount) { this.rentAmount = rentAmount; }
}
