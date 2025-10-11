package com.se2030.backend.observer;

import com.se2030.backend.model.Client;
import com.se2030.backend.model.Project;
import com.se2030.backend.service.TwilioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class ClientSMSNotificationObserver implements ProjectStatusObserver {
    
    @Autowired
    private TwilioService twilioService;
    
    @Override
    public void onProjectStatusChanged(Project project, String oldStatus, String newStatus) {
        Client client = project.getClient();
        if (client != null && twilioService.isPhoneNumberValid(client.getPhone())) {
            
            String message = buildSMSMessage(project, oldStatus, newStatus);
            twilioService.sendSMS(client.getPhone(), message);
            
            System.out.println("SMS notification sent to client: " + client.getName() + 
                             " for project: " + project.getName());
        } else {
            System.out.println("No valid phone number available for client: " + 
                             (client != null ? client.getName() : "Unknown"));
        }
    }
    
    private String buildSMSMessage(Project project, String oldStatus, String newStatus) {
        StringBuilder message = new StringBuilder();
        message.append("🏗️ Project Update: ").append(project.getName()).append("\n");
        
        if (oldStatus != null && newStatus != null) {
            message.append("Status changed from ").append(oldStatus).append(" to ").append(newStatus).append("\n");
        } else if (newStatus != null) {
            message.append("Project status: ").append(newStatus).append("\n");
        }
        
        if (project.getLocation() != null && !project.getLocation().trim().isEmpty()) {
            message.append("Location: ").append(project.getLocation()).append("\n");
        }
        
        message.append("Thank you for choosing our construction services!");
        
        return message.toString();
    }
    
    @Override
    public String getObserverType() {
        return "CLIENT_SMS";
    }
}
