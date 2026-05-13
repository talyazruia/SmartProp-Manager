package com.example.SmartProp.controller;

import com.example.SmartProp.model.Tenant;
import com.example.SmartProp.repository.TenantRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tenants")
@CrossOrigin(origins = "http://localhost:3000")
public class TenantController {

    @Autowired
    private TenantRepository tenantRepository;

    @PostMapping
    public Tenant createTenant(@RequestBody Tenant tenant) {
        try {
            System.out.println("Saving tenant: " + tenant.getUsername());
            return tenantRepository.save(tenant);
        } catch (Exception e) {
            e.printStackTrace();
            throw e;
        }
    }

    @GetMapping
    public List<Tenant> getAllTenants() {
        return tenantRepository.findAll();
    }
}