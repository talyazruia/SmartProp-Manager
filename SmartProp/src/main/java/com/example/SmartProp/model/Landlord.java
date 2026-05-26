package com.example.SmartProp.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;

@Entity
public class Landlord {

    @Id
    private String username;

    private String password;
    private String firstName;
    private String lastName;

    // טלפון רגיל של המשכיר
    private String phone;

    // פרטי חשבון בנק
    private String bankName;
    private String bankBranch;
    private String bankAccountNumber;

    // מספר טלפון לקבלת תשלום בביט
    private String bitPhoneNumber;

    // תעריף החשמל שנקבע על ידי משכיר זה עבור הנכסים שלו
    private double electricityRate = 0.6;

    public Landlord() {
    }

    public Landlord(
            String username,
            String password,
            String firstName,
            String lastName,
            String phone,
            String bankName,
            String bankBranch,
            String bankAccountNumber,
            String bitPhoneNumber,
            double electricityRate
    ) {
        this.username = username;
        this.password = password;
        this.firstName = firstName;
        this.lastName = lastName;
        this.phone = phone;
        this.bankName = bankName;
        this.bankBranch = bankBranch;
        this.bankAccountNumber = bankAccountNumber;
        this.bitPhoneNumber = bitPhoneNumber;
        this.electricityRate = electricityRate;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getBankName() {
        return bankName;
    }

    public void setBankName(String bankName) {
        this.bankName = bankName;
    }

    public String getBankBranch() {
        return bankBranch;
    }

    public void setBankBranch(String bankBranch) {
        this.bankBranch = bankBranch;
    }

    public String getBankAccountNumber() {
        return bankAccountNumber;
    }

    public void setBankAccountNumber(String bankAccountNumber) {
        this.bankAccountNumber = bankAccountNumber;
    }

    public String getBitPhoneNumber() {
        return bitPhoneNumber;
    }

    public void setBitPhoneNumber(String bitPhoneNumber) {
        this.bitPhoneNumber = bitPhoneNumber;
    }

    public double getElectricityRate() {
        return electricityRate;
    }

    public void setElectricityRate(double electricityRate) {
        this.electricityRate = electricityRate;
    }
}