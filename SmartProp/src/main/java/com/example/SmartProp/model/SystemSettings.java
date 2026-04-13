package com.example.SmartProp.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;

@Entity
public class SystemSettings {
    @Id
    private String settingKey;
    private double settingValue;

    // Getters and Setters
    public String getSettingKey() { return settingKey; }
    public void setSettingKey(String settingKey) { this.settingKey = settingKey; }
    public double getSettingValue() { return settingValue; }
    public void setSettingValue(double settingValue) { this.settingValue = settingValue; }
}