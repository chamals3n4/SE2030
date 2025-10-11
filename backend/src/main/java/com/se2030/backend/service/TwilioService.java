package com.se2030.backend.service;

import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;

@Service
public class TwilioService {
    
    @Value("${twilio.account.sid}")
    private String accountSid;
    
    @Value("${twilio.api.key}")
    private String apiKey;
    
    @Value("${twilio.api.secret}")
    private String apiSecret;
    
    @Value("${twilio.phone.number}")
    private String fromPhoneNumber;
    
    @PostConstruct
    public void init() {
        try {
            Twilio.init(apiKey, apiSecret, accountSid);
            System.out.println("Twilio initialized successfully");
        } catch (Exception e) {
            System.err.println("Failed to initialize Twilio: " + e.getMessage());
        }
    }
    
    public void sendSMS(String toPhoneNumber, String message) {
        try {
            Message.creator(
                new PhoneNumber(toPhoneNumber),
                new PhoneNumber(fromPhoneNumber),
                message
            ).create();
            
            System.out.println("SMS sent successfully to: " + toPhoneNumber);
        } catch (Exception e) {
            System.err.println("Failed to send SMS to " + toPhoneNumber + ": " + e.getMessage());
        }
    }
    
    public boolean isPhoneNumberValid(String phoneNumber) {
        return phoneNumber != null && 
               !phoneNumber.trim().isEmpty() && 
               phoneNumber.matches("^\\+?[1-9]\\d{1,14}$");
    }
}
