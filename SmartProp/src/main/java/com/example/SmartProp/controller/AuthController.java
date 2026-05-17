package com.example.SmartProp.controller;

import com.example.SmartProp.model.Tenant;
import com.example.SmartProp.model.Landlord;
import com.example.SmartProp.repository.TenantRepository;
import com.example.SmartProp.repository.LandlordRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private TenantRepository tenantRepository;

    @Autowired
    private LandlordRepository landlordRepository;

    @PostMapping("/login")
    public Map<String, String> login(@RequestBody Map<String, String> credentials) {
        String username = credentials.get("username");
        String password = credentials.get("password");

        Optional<Tenant> tenant = tenantRepository.findById(username);
        if (tenant.isPresent() && tenant.get().getPassword().equals(password)) {
            return Map.of(
    "status", "success", 
    "role", "tenant", 
    "name", tenant.get().getFirstName() + " " + tenant.get().getLastName(),
    "username", tenant.get().getUsername(),
    "apartmentId", tenant.get().getApartmentId() != null ? tenant.get().getApartmentId() : ""
);
        }

        Optional<Landlord> landlord = landlordRepository.findById(username);
        if (landlord.isPresent() && landlord.get().getPassword().equals(password)) {
            return Map.of(
                "status", "success", 
                "role", "landlord", 
                "name", landlord.get().getFirstName() + " " + landlord.get().getLastName(),
                "username", landlord.get().getUsername()
                );
        }

        return Map.of("status", "error", "message", "שם משתמש או סיסמה שגויים");
    }

    @PostMapping("/register/tenant")
    public Map<String, String> registerTenant(@RequestBody Tenant tenant) {
        if (tenantRepository.existsById(tenant.getUsername()) || landlordRepository.existsById(tenant.getUsername())) {
            return Map.of("status", "error", "message", "שם המשתמש כבר קיים");
        }
        tenantRepository.save(tenant);
        return Map.of("status", "success", "message", "שוכר נרשם בהצלחה");
    }

    @PostMapping("/register/landlord")
    public Map<String, String> registerLandlord(@RequestBody Landlord landlord) {
        if (landlordRepository.existsById(landlord.getUsername()) || tenantRepository.existsById(landlord.getUsername())) {
            return Map.of("status", "error", "message", "שם המשתמש כבר קיים");
        }
        landlordRepository.save(landlord);
        return Map.of("status", "success", "message", "משכיר נרשם בהצלחה");
    }
}
