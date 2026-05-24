package com.example.SmartProp.service;

import org.json.JSONArray;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import jakarta.annotation.PostConstruct;

import javax.net.ssl.SSLContext;
import javax.net.ssl.TrustManager;
import javax.net.ssl.X509TrustManager;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.security.SecureRandom;
import java.security.cert.X509Certificate;
import java.util.Base64;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class VisionService {

    @Value("${google.api.key:AIzaSyB_U_sgTrzoDbxAK5SEv8vE7hSFXsAhldE}")
    private String googleApiKey;

    private String apiUrl;

    @PostConstruct
    public void init() {
        this.apiUrl = "https://vision.googleapis.com/v1/images:annotate?key=" + googleApiKey;
    }

    // פונקציה חיונית לעקיפת שגיאות SSL בסביבת הפיתוח
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

    public String extractTextFromImage(String base64Image, double previousReading) {
        try {
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

            // שימוש בקליינט המיוחד שעוקף בעיות פרוטוקול
            HttpClient client = createUnsafeHttpClient();
            
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(apiUrl))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody.toString()))
                    .build();

            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
            
            // הדפסת דיבאג שימושית לבדיקת התשובה מגוגל
            System.out.println("GOOGLE_DEBUG_RESPONSE: " + response.body());

            JSONObject jsonResponse = new JSONObject(response.body());

            if (jsonResponse.has("error")) {
                return ""; 
            }

            if (jsonResponse.has("responses")) {
                JSONArray responsesArray = jsonResponse.getJSONArray("responses");
                if (responsesArray.length() > 0 && responsesArray.getJSONObject(0).has("textAnnotations")) {
                    
                    JSONArray annotations = responsesArray.getJSONObject(0).getJSONArray("textAnnotations");
                    String fullText = annotations.getJSONObject(0).getString("description");
                    
                    String cleanedText = fullText.replaceAll("(?<!\\n) +(?!\\n)", ""); 

                    Pattern pattern = Pattern.compile("\\d{4,6}(\\.\\d+)?");
                    Matcher matcher = pattern.matcher(cleanedText);

                    String bestReadingStr = "";

                    while (matcher.find()) {
                        String match = matcher.group();
                        try {
                            double val = Double.parseDouble(match);
                            
                            boolean isValid = (previousReading > 0) ? (val >= previousReading) : (val > 0);

                            if (previousReading == 0 && (val == 1000 || val == 10000 || val == 2012 || val == 240)) {
                                continue; 
                            }

                            if (isValid && val <= 999999) {
                                bestReadingStr = match;
                                break; 
                            }
                        } catch (NumberFormatException e) {
                            // התעלמות משגיאות המרה מקומיות
                        }
                    }

                    if (!bestReadingStr.isEmpty()) {
                        return bestReadingStr;
                    }
                }
            }
            
            return "";

        } catch (Exception e) {
            return "";
        }
    }
}