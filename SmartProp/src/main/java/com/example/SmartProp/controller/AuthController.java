package com.example.SmartProp.controller;

import com.example.SmartProp.model.Tenant;
import com.example.SmartProp.model.Landlord;
import com.example.SmartProp.repository.TenantRepository;
import com.example.SmartProp.repository.LandlordRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(
    origins = "http://localhost:3000",
    allowedHeaders = "*",
    methods = {
        RequestMethod.GET,
        RequestMethod.POST,
        RequestMethod.PUT,
        RequestMethod.DELETE,
        RequestMethod.OPTIONS
    }
)
public class AuthController {

    @Autowired
    private TenantRepository tenantRepository;

    @Autowired
    private LandlordRepository landlordRepository;

    @PostMapping("/login")
    public Map<String, String> login(@RequestBody Map<String, String> credentials) {

        String username = credentials.get("username");
        String password = credentials.get("password");

        // ===== TENANT LOGIN =====

        Optional<Tenant> tenant = tenantRepository.findById(username);

        if (tenant.isPresent() &&
            tenant.get().getPassword().equals(password)) {

            return Map.of(
                "status", "success",
                "role", "tenant",
                "name",
                tenant.get().getFirstName() + " " +
                tenant.get().getLastName(),

                "username",
                tenant.get().getUsername(),

                // ✔️ FIX
                "apartmentId",
                tenant.get().getApartmentId() != null
                    ? String.valueOf(tenant.get().getApartmentId())
                    : ""
            );
        }

        // ===== LANDLORD LOGIN =====

        Optional<Landlord> landlord =
            landlordRepository.findById(username);

        if (landlord.isPresent() &&
            landlord.get().getPassword().equals(password)) {

            return Map.of(
                "status", "success",
                "role", "landlord",

                "name",
                landlord.get().getFirstName() + " " +
                landlord.get().getLastName(),

                "username",
                landlord.get().getUsername()
            );
        }

        // ===== LOGIN FAILED =====

        return Map.of(
            "status", "error",
            "message", "שם משתמש או סיסמה שגויים"
        );
    }

    // ===== REGISTER TENANT =====

    @PostMapping("/register/tenant")
    public Map<String, String> registerTenant(
            @RequestBody Tenant tenant) {

        if (tenantRepository.existsById(tenant.getUsername())
                || landlordRepository.existsById(tenant.getUsername())) {

            return Map.of(
                "status", "error",
                "message", "שם המשתמש כבר קיים"
            );
        }

        tenantRepository.save(tenant);

        return Map.of(
            "status", "success",
            "message", "שוכר נרשם בהצלחה"
        );
    }

    // ===== REGISTER LANDLORD =====

    @PostMapping("/register/landlord")
    public Map<String, String> registerLandlord(
            @RequestBody Landlord landlord) {

        if (landlordRepository.existsById(landlord.getUsername())
                || tenantRepository.existsById(landlord.getUsername())) {

            return Map.of(
                "status", "error",
                "message", "שם המשתמש כבר קיים"
            );
        }

        landlordRepository.save(landlord);

        return Map.of(
            "status", "success",
            "message", "משכיר נרשם בהצלחה"
        );
    }
}