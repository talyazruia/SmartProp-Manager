package com.example.SmartProp.controller;

import com.example.SmartProp.model.Property;
import com.example.SmartProp.model.Tenant;
import com.example.SmartProp.model.Payment;
import com.example.SmartProp.repository.PropertyRepository;
import com.example.SmartProp.repository.TenantRepository;
import com.example.SmartProp.repository.PaymentRepository;

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

    @Autowired
    private PaymentRepository paymentRepository;

    // 1. הוספת דירה חדשה + קריאת מונה התחלתית (מאושרת אוטומטית)
    @PostMapping("/add")
    public Map<String, String> addProperty(@RequestBody Map<String, Object> payload) {
        try {
            // שמירת הדירה
            Property property = new Property();
            property.setAddress((String) payload.get("address"));
            property.setDescription((String) payload.get("description"));
            property.setRentAmount(Double.parseDouble(payload.get("rentAmount").toString()));
            property.setLandlordUsername((String) payload.get("landlordUsername"));
            
            Property savedProperty = propertyRepository.save(property);

            // שמירה בטבלת ה-payment עם אישור אוטומטי
            if (payload.containsKey("initialMeterReading") && payload.get("initialMeterReading") != null) {
                double initialReading = Double.parseDouble(payload.get("initialMeterReading").toString());
                
                Payment payment = new Payment();
                payment.setPropertyId(savedProperty.getId()); 
                payment.setMeterReading(initialReading);      
                payment.setDate(new java.util.Date().toInstant().atZone(java.time.ZoneId.systemDefault()).toLocalDate()); 
                
                // כאן אנחנו מסמנים שהתשלום/קריאה מאושרים אוטומטית
                payment.setApproved(true); 
                
                paymentRepository.save(payment);
            }

            return Map.of("status", "success", "message", "הדירה נוספה והקריאה אושרה בהצלחה");
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

    // 4. עדכון דירה
    @PutMapping("/update/{id}")
    public Map<String, String> updateProperty(@PathVariable Long id, @RequestBody Property propertyDetails) {
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

    // 6. השכרת / פינוי דירה
    @PutMapping("/{id}/rent")
    public Map<String, String> rentProperty(@PathVariable Long id, @RequestParam String tenantName) {
        try {
            Optional<Property> optionalProperty = propertyRepository.findById(id);
            if (optionalProperty.isPresent()) {
                Property property = optionalProperty.get();
                
                if (property.getTenant() != null && !property.getTenant().isEmpty()) {
                    String oldTenantEmail = property.getTenant().trim();
                    Optional<Tenant> oldTenantOpt = tenantRepository.findById(oldTenantEmail);
                    if (oldTenantOpt.isPresent()) {
                        Tenant oldTenant = oldTenantOpt.get();
                        oldTenant.setApartmentId(null);
                        tenantRepository.save(oldTenant);
                    }
                }

                if (tenantName == null || tenantName.trim().isEmpty()) {
                    property.setRented(false);
                    property.setTenant(null);
                    propertyRepository.save(property);
                    return Map.of("status", "success", "message", "הדירה פונתה בהצלחה");
                }

                String tenantEmail = tenantName.trim().toLowerCase();
                Optional<Tenant> newTenantOpt = tenantRepository.findById(tenantEmail);
                if (!newTenantOpt.isPresent()) {
                    return Map.of("status", "error", "message", "השוכר לא נמצא במערכת");
                }

                Tenant newTenant = newTenantOpt.get();
                property.setRented(true);
                property.setTenant(tenantEmail); 
                propertyRepository.save(property);
                newTenant.setApartmentId(id);
                tenantRepository.save(newTenant);

                return Map.of("status", "success", "message", "הדירה והשוכר שויכו בהצלחה!");
            }
            return Map.of("status", "error", "message", "לא נמצאה דירה");
        } catch (Exception e) {
            return Map.of("status", "error", "message", e.getMessage());
        }
    }
}