package com.example.SmartProp.controller;

import com.example.SmartProp.model.Landlord;
import com.example.SmartProp.repository.LandlordRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/landlords")
@CrossOrigin(origins = "http://localhost:3000")
public class LandlordController {

    @Autowired
    private LandlordRepository landlordRepository;

    @PostMapping
    public Landlord createLandlord(@RequestBody Landlord landlord) {
        System.out.println(">>> Request received for username: " + landlord.getUsername());
        return landlordRepository.save(landlord);
    }

    @GetMapping
    public List<Landlord> getAllLandlords() {
        return landlordRepository.findAll();
    }
}