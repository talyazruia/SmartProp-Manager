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

    // שליפת פרטי בעל דירה לפי username
    @GetMapping("/{username}")
    public Landlord getLandlord(@PathVariable String username) {
        return landlordRepository.findById(username).orElse(null);
    }

    // עדכון פרטי בנק וביט
    @PutMapping("/{username}/payment-details")
    public Landlord updatePaymentDetails(@PathVariable String username, @RequestBody Landlord details) {
        return landlordRepository.findById(username).map(landlord -> {
            landlord.setBankName(details.getBankName());
            landlord.setBankBranch(details.getBankBranch());
            landlord.setBankAccountNumber(details.getBankAccountNumber());
            landlord.setBitPhoneNumber(details.getBitPhoneNumber()); // כאן העדכון של הביט
            return landlordRepository.save(landlord);
        }).orElseThrow(() -> new RuntimeException("Landlord not found"));
    }

    @PostMapping
    public Landlord createLandlord(@RequestBody Landlord landlord) {
        return landlordRepository.save(landlord);
    }

    @GetMapping
    public List<Landlord> getAllLandlords() {
        return landlordRepository.findAll();
    }
}