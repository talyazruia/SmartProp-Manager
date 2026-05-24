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

    @PostMapping("/add")
    public Map<String, String> addProperty(@RequestBody Property property) {
        try {
            propertyRepository.save(property);
            return Map.of("status", "success", "message", "הדירה נוספה בהצלחה למערכת");
        } catch (Exception e) {
            return Map.of("status", "error", "message", "שגיאה בהוספת הדירה: " + e.getMessage());
        }
    }

    @GetMapping("/landlord/{username}")
    public List<Property> getPropertiesByLandlord(@PathVariable String username) {
        return propertyRepository.findByLandlordUsername(username);
    }

    @GetMapping("/all")
    public List<Property> getAllProperties() {
        return propertyRepository.findAll();
    }

    @PutMapping("/update/{id}")
    public Map<String, String> updateProperty(@PathVariable Long id, @RequestBody Property propertyDetails) {
        Optional<Property> optionalProperty = propertyRepository.findById(id);
        if (optionalProperty.isPresent()) {
            Property property = optionalProperty.get();
            property.setAddress(propertyDetails.getAddress());
            property.setRentAmount(propertyDetails.getRentAmount());
            property.setLandlordUsername(propertyDetails.getLandlordUsername());
            propertyRepository.save(property);
            return Map.of("status", "success", "message", "פרטי הדירה עודכנו בהצלחה");
        } else {
            return Map.of("status", "error", "message", "הדירה לא נמצאה במערכת");
        }
    }

    @DeleteMapping("/delete/{id}")
    public Map<String, String> deleteProperty(@PathVariable Long id) {
        try {
            if (propertyRepository.existsById(id)) {
                propertyRepository.deleteById(id);
                return Map.of("status", "success", "message", "הדירה נמחקה בהצלחה");
            } else {
                return Map.of("status", "error", "message", "הדירה לא נמצאה");
            }
        } catch (Exception e) {
            return Map.of("status", "error", "message", "שגיאה במחיקת הדירה: " + e.getMessage());
        }
    }

    // *** תוקן: endpoint לעדכון דירה כמושכרת עם שם השוכר ***
    @PutMapping("/{id}/rent")
    public Map<String, String> rentProperty(
            @PathVariable Long id,
            @RequestParam String tenantName) {
        Optional<Property> optionalProperty = propertyRepository.findById(id);
        if (optionalProperty.isPresent()) {
            Property property = optionalProperty.get();
            property.setRented(true);
            property.setTenant(tenantName);
            propertyRepository.save(property);
            return Map.of("status", "success", "message", "הדירה עודכנה כמושכרת");
        } else {
            return Map.of("status", "error", "message", "הדירה לא נמצאה");
        }
    }
}
