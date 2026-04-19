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

    // 1. הוספת דירה חדשה למערכת
    @PostMapping("/add")
    public Map<String, String> addProperty(@RequestBody Property property) {
        try {
            propertyRepository.save(property);
            return Map.of("status", "success", "message", "הדירה נוספה בהצלחה למערכת");
        } catch (Exception e) {
            return Map.of("status", "error", "message", "שגיאה בהוספת הדירה: " + e.getMessage());
        }
    }

    // 2. משיכת כל הדירות של משכיר ספציפי (לפי שם משתמש)
    @GetMapping("/landlord/{username}")
    public List<Property> getPropertiesByLandlord(@PathVariable String username) {
        return propertyRepository.findByLandlordUsername(username);
    }

    // 3. משיכת כל הדירות הקיימות במערכת (למשל עבור חיפוש שוכרים)
    @GetMapping("/all")
    public List<Property> getAllProperties() {
        return propertyRepository.findAll();
    }

    // 4. עדכון פרטי דירה קיימת (או שיוך שוכר)
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

    // 5. מחיקת דירה מהמערכת
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
}
