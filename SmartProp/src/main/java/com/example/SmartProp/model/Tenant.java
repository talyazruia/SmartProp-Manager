package com.example.SmartProp.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;

@Entity
public class Tenant {
    @Id
    private String username; // מפתח ראשי
    private String password;
    private String fullName;
    private String email;
    private String phoneNumber;

    // קונסטרקטור ריק חובה עבור JPA
    public Tenant() {}

    // Getters and Setters
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
}
