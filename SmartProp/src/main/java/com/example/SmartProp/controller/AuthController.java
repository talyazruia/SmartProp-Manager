package com.example.SmartProp.controller;

import com.example.SmartProp.model.Tenant;
import com.example.SmartProp.model.Landlord;
import com.example.SmartProp.repository.TenantRepository;
import com.example.SmartProp.repository.LandlordRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {

    @Autowired
    private TenantRepository tenantRepository;

    @Autowired
    private LandlordRepository landlordRepository;

    // --- פונקציית התחברות (Login) ---
    @PostMapping("/login")
    public Map<String, String> login(@RequestBody Map<String, String> credentials) {
        String username = credentials.get("username");
        String password = credentials.get("password");

        // בדיקה בטבלת שוכרים
        var tenant = tenantRepository.findById(username);
        if (tenant.isPresent() && tenant.get().getPassword().equals(password)) {
            return Map.of("status", "success", "role", "tenant", "name", tenant.get().getFullName());
        }

        // בדיקה בטבלת משכירים
        var landlord = landlordRepository.findById(username);
        if (landlord.isPresent() && landlord.get().getPassword().equals(password)) {
            return Map.of("status", "success", "role", "landlord", "name", landlord.get().getFullName());
        }

        return Map.of("status", "error", "message", "שם משתמש או סיסמה שגויים");
    }

    // --- פונקציית הרשמה לשוכר ---
    @PostMapping("/register/tenant")
    public Map<String, String> registerTenant(@RequestBody Tenant newTenant) {
        // בדיקה אם שם המשתמש קיים בשוכרים או במשכירים (כדי למנוע כפילויות במערכת)
        if (tenantRepository.existsById(newTenant.getUsername()) || landlordRepository.existsById(newTenant.getUsername())) {
            return Map.of("status", "error", "message", "שם המשתמש כבר תפוס במערכת");
        }

        tenantRepository.save(newTenant);
        return Map.of("status", "success", "message", "שוכר נרשם בהצלחה!");
    }

    // --- פונקציית הרשמה למשכיר ---
    @PostMapping("/register/landlord")
    public Map<String, String> registerLandlord(@RequestBody Landlord newLandlord) {
        if (landlordRepository.existsById(newLandlord.getUsername()) || tenantRepository.existsById(newLandlord.getUsername())) {
            return Map.of("status", "error", "message", "שם המשתמש כבר תפוס במערכת");
        }

        landlordRepository.save(newLandlord);
        return Map.of("status", "success", "message", "משכיר נרשם בהצלחה!");
    }
}
