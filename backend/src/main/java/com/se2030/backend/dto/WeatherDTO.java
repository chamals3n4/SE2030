package com.se2030.backend.dto;

public class WeatherDTO {
    private String location;
    private String description;
    private double temperatureCelsius;
    private int humidity;
    private double windSpeedMetersPerSecond;
    private String icon;

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public double getTemperatureCelsius() {
        return temperatureCelsius;
    }

    public void setTemperatureCelsius(double temperatureCelsius) {
        this.temperatureCelsius = temperatureCelsius;
    }

    public int getHumidity() {
        return humidity;
    }

    public void setHumidity(int humidity) {
        this.humidity = humidity;
    }

    public double getWindSpeedMetersPerSecond() {
        return windSpeedMetersPerSecond;
    }

    public void setWindSpeedMetersPerSecond(double windSpeedMetersPerSecond) {
        this.windSpeedMetersPerSecond = windSpeedMetersPerSecond;
    }

    public String getIcon() {
        return icon;
    }

    public void setIcon(String icon) {
        this.icon = icon;
    }
}


