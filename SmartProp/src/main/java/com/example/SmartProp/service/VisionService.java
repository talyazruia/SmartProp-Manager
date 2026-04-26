package com.example.SmartProp.service;

import org.json.JSONArray;
import org.json.JSONObject;
import org.springframework.stereotype.Service;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class VisionService {

    // ה-API Key שלך מגוגל
    private final String GOOGLE_API_KEY = "AIzaSyB_U_sgTrzoDbxAK5SEv8vE7hSFXsAhldE";
    private final String API_URL = "https://vision.googleapis.com/v1/images:annotate?key=" + GOOGLE_API_KEY;

    public String extractTextFromImage(String base64Image) {
        try {
            // בניית גוף הבקשה (JSON)
            JSONObject requestBody = new JSONObject();
            JSONArray requests = new JSONArray();
            JSONObject requestItem = new JSONObject();
            
            JSONObject image = new JSONObject();
            image.put("content", base64Image);
            
            JSONArray features = new JSONArray();
            JSONObject feature = new JSONObject();
            feature.put("type", "TEXT_DETECTION");
            features.put(feature);
            
            requestItem.put("image", image);
            requestItem.put("features", features);
            requests.put(requestItem);
            requestBody.put("requests", requests);

            // שליחת הבקשה לגוגל
            HttpClient client = HttpClient.newHttpClient();
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(API_URL))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody.toString()))
                    .build();

            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
            String body = response.body();

            // הדפסת התשובה לטרמינל לצרכי דיבאג (חשוב!)
            System.out.println("GOOGLE_DEBUG_RESPONSE: " + body);

            JSONObject jsonResponse = new JSONObject(body);

            // טיפול בשגיאות מה-API (כמו בעיית Billing)
            if (jsonResponse.has("error")) {
                String errorMsg = jsonResponse.getJSONObject("error").getString("message");
                System.out.println("!!! Google API Error: " + errorMsg);
                return ""; 
            }

            // חילוץ הטקסט מהתשובה של גוגל
            if (jsonResponse.has("responses")) {
                JSONArray responsesArray = jsonResponse.getJSONArray("responses");
                if (responsesArray.length() > 0 && responsesArray.getJSONObject(0).has("fullTextAnnotation")) {
                    String fullText = responsesArray.getJSONObject(0).getJSONObject("fullTextAnnotation").getString("text");
                    return cleanMeterReading(fullText);
                }
            }
            
            return "";

        } catch (Exception e) {
            System.out.println("Exception in VisionService: " + e.getMessage());
            e.printStackTrace();
            return "";
        }
    }

    private String cleanMeterReading(String text) {
        // שלב 1: הדפסת הטקסט הגולמי שגוגל זיהה
        System.out.println("Raw text identified: " + text);

        // שלב 2: ניקוי תווים לא רלוונטיים (רווחים, ירידות שורה וכו')
        String cleanText = text.replaceAll("[\\s\\n\\r]", "");
        
        // שלב 3: חיפוש רצף של 5 ספרות (המונה שלך: 01326)
        Pattern pattern = Pattern.compile("\\d{5}");
        Matcher matcher = pattern.matcher(cleanText);
        
        if (matcher.find()) {
            return matcher.group();
        }
        
        // שלב 4: גיבוי - אם לא נמצאו 5 ספרות רצופות, נחפש רצף של 4-7 ספרות
        Pattern fallbackPattern = Pattern.compile("\\d{4,7}");
        Matcher fallbackMatcher = fallbackPattern.matcher(cleanText);
        if (fallbackMatcher.find()) {
            return fallbackMatcher.group();
        }
        
        return "";
    }
}