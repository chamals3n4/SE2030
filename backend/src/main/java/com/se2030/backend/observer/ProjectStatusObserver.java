package com.se2030.backend.observer;

import com.se2030.backend.model.Project;

public interface ProjectStatusObserver {
    void onProjectStatusChanged(Project project, String oldStatus, String newStatus);
    String getObserverType();
}
