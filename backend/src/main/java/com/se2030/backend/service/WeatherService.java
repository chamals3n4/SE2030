package com.se2030.backend.service;

import com.se2030.backend.dto.WeatherDTO;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.time.Instant;
import java.util.Map;

@Service
public class WeatherService {

    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${OPENWEATHER_API_KEY:}")
    private String apiKey;

    private WeatherDTO cached;
    private Instant cachedAt;
    private static final long CACHE_TTL_SECONDS = 300;

    public WeatherDTO getSriLankaWeather() {
        if (cached != null && cachedAt != null) {
            if (Instant.now().isBefore(cachedAt.plusSeconds(CACHE_TTL_SECONDS))) {
                return cached;
            }
        }

        if (apiKey == null || apiKey.isBlank()) {
            throw new IllegalStateException("OPENWEATHER_API_KEY is not configured");
        }

        String url = "https://api.openweathermap.org/data/2.5/weather?q=Colombo,LK&appid=" + apiKey + "&units=metric";
        ResponseEntity<Map> response;
        try {
            response = restTemplate.getForEntity(url, Map.class);
        } catch (HttpClientErrorException e) {
            throw new IllegalStateException("OpenWeather request failed: " + e.getStatusCode() + " - " + e.getResponseBodyAsString());
        }

        Map body = response.getBody();
        if (body == null) {
            throw new IllegalStateException("No response from OpenWeather");
        }

        WeatherDTO dto = new WeatherDTO();
        dto.setLocation("Colombo, Sri Lanka");

        try {
            Map main = (Map) body.get("main");
            Map wind = (Map) body.get("wind");
            Object weatherArr = body.get("weather");

            if (main != null) {
                Object temp = main.get("temp");
                Object humidity = main.get("humidity");
                if (temp instanceof Number) dto.setTemperatureCelsius(((Number) temp).doubleValue());
                if (humidity instanceof Number) dto.setHumidity(((Number) humidity).intValue());
            }

            if (wind != null) {
                Object speed = wind.get("speed");
                if (speed instanceof Number) dto.setWindSpeedMetersPerSecond(((Number) speed).doubleValue());
            }

            if (weatherArr instanceof java.util.List<?> list && !list.isEmpty()) {
                Object first = list.get(0);
                if (first instanceof Map firstMap) {
                    Object desc = firstMap.get("description");
                    Object icon = firstMap.get("icon");
                    if (desc != null) dto.setDescription(String.valueOf(desc));
                    if (icon != null) dto.setIcon(String.valueOf(icon));
                }
            }
        } catch (Exception e) {
            throw new IllegalStateException("Failed to parse OpenWeather response", e);
        }

        cached = dto;
        cachedAt = Instant.now();
        return dto;
    }
}


