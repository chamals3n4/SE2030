package com.se2030.backend.controller;

import com.se2030.backend.dto.WeatherDTO;
import com.se2030.backend.service.WeatherService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/public/weather")
@CrossOrigin(origins = "*")
public class PublicWeatherController {

    private final WeatherService weatherService;

    public PublicWeatherController(WeatherService weatherService) {
        this.weatherService = weatherService;
    }

    @GetMapping
    public ResponseEntity<?> getWeather() {
        try {
            WeatherDTO dto = weatherService.getSriLankaWeather();
            return new ResponseEntity<>(dto, HttpStatus.OK);
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(java.util.Map.of("error", e.getMessage()));
        }
    }
}


