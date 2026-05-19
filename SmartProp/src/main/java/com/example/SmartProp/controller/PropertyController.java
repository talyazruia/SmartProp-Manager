package com.example.SmartProp.controller;

import com.example.SmartProp.model.Property;
import com.example.SmartProp.model.Tenant;
import com.example.SmartProp.repository.PropertyRepository;
import com.example.SmartProp.repository.TenantRepository;

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
    private TenantRepository tenantRepository;
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

    // ✅ 6. השכרת / פינוי דירה (חיפוש לפי שם מלא)
    @PutMapping("/{id}/rent")
    public Map<String, String> rentProperty(
            @PathVariable Long id,
            @RequestParam String tenantName) {

        try {
            Optional<Property> optionalProperty = propertyRepository.findById(id);

            if (optionalProperty.isPresent()) {
                Property property = optionalProperty.get();
                
                // שלב א': ניקוי הדירה מהדייר הקודם (אם היה כזה)
                if (property.getTenant() != null && !property.getTenant().isEmpty()) {
                    // מפצלים את השם הישן כדי למצוא אותו בדאטאבייס ולנקות לו את ה-apartmentId
                    String[] oldNameParts = property.getTenant().trim().split("\\s+", 2);
                    if (oldNameParts.length == 2) {
                        Optional<Tenant> oldTenantOpt = tenantRepository.findByFirstNameAndLastName(oldNameParts[0], oldNameParts[1]);
                        if (oldTenantOpt.isPresent()) {
                            Tenant oldTenant = oldTenantOpt.get();
                            oldTenant.setApartmentId(null);
                            tenantRepository.save(oldTenant);
                        }
                    }
                }

                // מצב 1: בקשת פינוי דירה (tenantName מגיע ריק מה-Frontend)
                if (tenantName == null || tenantName.trim().isEmpty()) {
                    property.setRented(false);
                    property.setTenant(null);
                    propertyRepository.save(property);
                    return Map.of("status", "success", "message", "הדירה פונתה בהצלחה והדייר עודכן");
                }

                // מצב 2: שיוך שוכר חדש לדירה לפי שם מלא
                String[] nameParts = tenantName.trim().split("\\s+", 2); // מפצל את "ישראל ישראל" לשני חלקים לפי הרווח
                if (nameParts.length < 2) {
                    return Map.of("status", "error", "message", "נא להזין שם מלא (שם פרטי ומשפחה) של השוכר");
                }

                String firstName = nameParts[0];
                String lastName = nameParts[1];

                Optional<Tenant> newTenantOpt = tenantRepository.findByFirstNameAndLastName(firstName, lastName);
                if (!newTenantOpt.isPresent()) {
                    return Map.of("status", "error", "message", "השוכר '" + tenantName + "' לא נמצא במערכת");
                }

                Tenant newTenant = newTenantOpt.get();

                // 1. עדכון טבלת הדירות (Properties) - שומרים את השם המלא בתור tenant
                property.setRented(true);
                property.setTenant(tenantName); 
                propertyRepository.save(property);

                // 2. עדכון טבלת השוכרים (Tenants)
                newTenant.setApartmentId(id); // שמירת מזהה הדירה אצל הדייר
                tenantRepository.save(newTenant);

                return Map.of("status", "success", "message", "הדירה והשוכר שויכו ועודכנו בהצלחה!");
            }

            return Map.of("status", "error", "message", "לא נמצאה דירה");

        } catch (Exception e) {
            return Map.of("status", "error", "message", e.getMessage());
        }
    }
}