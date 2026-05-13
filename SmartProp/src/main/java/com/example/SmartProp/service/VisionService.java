package com.example.SmartProp.service;

import org.json.JSONArray;
import org.json.JSONObject;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;

import javax.net.ssl.SSLContext;
import javax.net.ssl.TrustManager;
import javax.net.ssl.X509TrustManager;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.security.SecureRandom;
import java.security.cert.X509Certificate;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class VisionService {

    @Value("${google.api.key}")
    private String googleApiKey;

    private String getApiUrl() {
        return "https://vision.googleapis.com/v1/images:annotate?key=" + googleApiKey;
    }

    // פונקציה ליצירת קליינט שעוקף בדיקות SSL
    private HttpClient createUnsafeHttpClient() throws Exception {
        TrustManager[] trustAllCerts = new TrustManager[]{
            new X509TrustManager() {
                public X509Certificate[] getAcceptedIssuers() { return null; }
                public void checkClientTrusted(X509Certificate[] certs, String authType) { }
                public void checkServerTrusted(X509Certificate[] certs, String authType) { }
            }
        };

        SSLContext sslContext = SSLContext.getInstance("SSL");
        sslContext.init(null, trustAllCerts, new SecureRandom());

        return HttpClient.newBuilder()
                .sslContext(sslContext)
                .build();
    }

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

            // שימוש בקליינט ה"לא מאובטח" כדי לעקוף את שגיאת ה-SSL
            HttpClient client = createUnsafeHttpClient();
            
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(getApiUrl()))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody.toString()))
                    .build();

            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
            String body = response.body();

            System.out.println("GOOGLE_DEBUG_RESPONSE: " + body);

            JSONObject jsonResponse = new JSONObject(body);

            if (jsonResponse.has("error")) {
                String errorMsg = jsonResponse.getJSONObject("error").getString("message");
                System.out.println("!!! Google API Error: " + errorMsg);
                return ""; 
            }

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
        System.out.println("Raw text identified: " + text);
        String cleanText = text.replaceAll("[\\s\\n\\r]", "");
        
        Pattern pattern = Pattern.compile("\\d{5}");
        Matcher matcher = pattern.matcher(cleanText);
        
        if (matcher.find()) {
            return matcher.group();
        }
        
        Pattern fallbackPattern = Pattern.compile("\\d{4,7}");
        Matcher fallbackMatcher = fallbackPattern.matcher(cleanText);
        if (fallbackMatcher.find()) {
            return fallbackMatcher.group();
        }
        
        return "";
    }
}