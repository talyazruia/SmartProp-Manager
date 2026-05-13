package com.example.SmartProp.controller;

import com.example.SmartProp.model.Property;
import com.example.SmartProp.repository.PropertyRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/properties")
@CrossOrigin(origins = "http://localhost:3000")
public class PropertyController {

    @Autowired
    private PropertyRepository propertyRepository;

    // 1. הוספת דירה חדשה
    @PostMapping("/add")
    public Map<String, String> addProperty(@RequestBody Property property) {
        try {
            propertyRepository.save(property);
            return Map.of("status", "success", "message", "הדירה נוספה בהצלחה");
        } catch (Exception e) {
            return Map.of("status", "error", "message", e.getMessage());
        }
    }

    // 2. דירות לפי משכיר
    @GetMapping("/landlord/{username}")
    public List<Property> getPropertiesByLandlord(@PathVariable String username) {
        return propertyRepository.findByLandlordUsername(username);
    }

    // 3. כל הדירות
    @GetMapping("/all")
    public List<Property> getAllProperties() {
        return propertyRepository.findAll();
    }

    // 4. עדכון דירה כללית
    @PutMapping("/update/{id}")
    public Map<String, String> updateProperty(
            @PathVariable Long id,
            @RequestBody Property propertyDetails) {

        Optional<Property> optionalProperty = propertyRepository.findById(id);

        if (optionalProperty.isPresent()) {
            Property property = optionalProperty.get();

            property.setAddress(propertyDetails.getAddress());
            property.setRentAmount(propertyDetails.getRentAmount());
            property.setLandlordUsername(propertyDetails.getLandlordUsername());

            propertyRepository.save(property);

            return Map.of("status", "success", "message", "עודכן בהצלחה");
        }

        return Map.of("status", "error", "message", "לא נמצא");
    }

    // 5. מחיקה
    @DeleteMapping("/delete/{id}")
    public Map<String, String> deleteProperty(@PathVariable Long id) {
        try {
            if (propertyRepository.existsById(id)) {
                propertyRepository.deleteById(id);
                return Map.of("status", "success", "message", "נמחק בהצלחה");
            }
            return Map.of("status", "error", "message", "לא נמצא");
        } catch (Exception e) {
            return Map.of("status", "error", "message", e.getMessage());
        }
    }

    // ✅ 6. השכרת דירה (זה מה שהיה חסר לך!)
    @PutMapping("/{id}/rent")
    public Map<String, String> rentProperty(
            @PathVariable Long id,
            @RequestParam String tenantName) {

        try {
            Optional<Property> optionalProperty = propertyRepository.findById(id);

            if (optionalProperty.isPresent()) {
                Property property = optionalProperty.get();

                property.setRented(true);
                property.setTenant(tenantName);

                propertyRepository.save(property);

                return Map.of("status", "success", "message", "הדירה סומנה כמושכרת");
            }

            return Map.of("status", "error", "message", "לא נמצאה דירה");

        } catch (Exception e) {
            return Map.of("status", "error", "message", e.getMessage());
        }
    }
}