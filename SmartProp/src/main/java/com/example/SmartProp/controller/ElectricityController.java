package com.example.SmartProp.controller;

import com.example.SmartProp.service.ElectricityService;
import com.example.SmartProp.service.VisionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.Base64;

@RestController
@RequestMapping("/api/electricity")
@CrossOrigin(origins = "http://localhost:3000") // מאפשר ל-React להתחבר לכאן
public class ElectricityController {

    @Autowired
    private ElectricityService electricityService;

    @Autowired
    private VisionService visionService;

    /**
     * חישוב ידני - מקבל מספרים ישירות מהפרונט
     */
    @GetMapping("/calculate")
    public String calculate(
            @RequestParam String username, 
            @RequestParam double current, 
            @RequestParam double previous, 
            @RequestParam(required = false, defaultValue = "0") double rate,
            @RequestParam boolean updateRate) {
        
        return electricityService.calculateAndSaveBill(username, current, previous, rate, updateRate);
    }

    /**
     * חישוב אוטומטי - מקבל תמונה, מפענח אותה דרך Hugging Face ומבצע חישוב
     */
    @PostMapping("/calculate-from-image")
    public String calculateFromImage(
            @RequestParam String username,
            @RequestParam double previous,
            @RequestParam(required = false, defaultValue = "0") double rate,
            @RequestParam boolean updateRate,
            @RequestParam("image") MultipartFile imageFile) {
        
        try {
            // 1. הפיכת הקובץ למחרוזת Base64 עבור ה-Service
            String base64Image = Base64.getEncoder().encodeToString(imageFile.getBytes());

            // 2. שליחה ל-VisionService (שמתחבר ל-Hugging Face)
            String extractedText = visionService.extractTextFromImage(base64Image);
            
            // 3. ניקוי הטקסט - השארת מספרים ונקודה בלבד
            String cleanNumber = extractedText.replaceAll("[^0-9.]", "");

            // בדיקת תקינות: אם אחרי הניקוי נשארנו עם מחרוזת ריקה - סימן שלא זוהו ספרות
            if (cleanNumber.isEmpty() || cleanNumber.equals(".")) {
                return "לא הצלחנו לזהות את הספרות במונה. אנא העלה תמונה חדשה ברורה יותר.";
            }

            // 4. המרה למספר וביצוע החישוב והשמירה ב-DB
            double currentReading = Double.parseDouble(cleanNumber);
            
            return electricityService.calculateAndSaveBill(username, currentReading, previous, rate, updateRate);

        } catch (Exception e) {
            // במקרה של שגיאה טכנית בתהליך (כמו נפילת API)
            return "אירעה שגיאה בתהליך הפענוח. וודא שהתמונה תקינה ונסה שוב.";
        }
    }
}