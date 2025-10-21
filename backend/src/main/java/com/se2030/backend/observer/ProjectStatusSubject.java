package com.se2030.backend.observer;

import com.se2030.backend.model.Project;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.util.ArrayList;
import java.util.List;

@Service
public class ProjectStatusSubject {
    
    @Autowired
    private ClientSMSNotificationObserver clientSMSObserver;
    
    private final List<ProjectStatusObserver> observers = new ArrayList<>();
    
    @PostConstruct
    public void init() {
        addObserver(clientSMSObserver);
        System.out.println("Project Status Subject initialized with " + observers.size() + " observers");
    }
    
    public void addObserver(ProjectStatusObserver observer) {
        if (!observers.contains(observer)) {
            observers.add(observer);
            System.out.println("Added observer: " + observer.getObserverType());
        }
    }
    
    public void removeObserver(ProjectStatusObserver observer) {
        observers.remove(observer);
        System.out.println("Removed observer: " + observer.getObserverType());
    }
    
    public void notifyStatusChange(Project project, String oldStatus, String newStatus) {
        System.out.println("Notifying " + observers.size() + " observers about project status change for: " + project.getName());
        
        for (ProjectStatusObserver observer : observers) {
            try {
                observer.onProjectStatusChanged(project, oldStatus, newStatus);
            } catch (Exception e) {
                System.err.println("Error notifying observer " + observer.getObserverType() + ": " + e.getMessage());
            }
        }
    }
    
    public int getObserverCount() {
        return observers.size();
    }
}
