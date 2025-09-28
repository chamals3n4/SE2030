package com.se2030.backend.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public class ProjectDashboardDTO {
    private Long projectId;
    private String name;
    private String description;
    private String location;
    private BigDecimal budget;
    private LocalDate startDate;
    private LocalDate endDate;
    private String status;
    private String clientName;

    private Integer teamSize;
    private Integer progress;
    private BigDecimal spent; // optional
    private String manager; // optional
    private String priority; // optional

    private Integer completedTasks;
    private Integer inProgressTasks;
    private Integer pendingTasks;
    private Integer openIssues;
    private Integer criticalIssues;

    public Long getProjectId() { return projectId; }
    public void setProjectId(Long projectId) { this.projectId = projectId; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public BigDecimal getBudget() { return budget; }
    public void setBudget(BigDecimal budget) { this.budget = budget; }
    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }
    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Integer getTeamSize() { return teamSize; }
    public void setTeamSize(Integer teamSize) { this.teamSize = teamSize; }
    public Integer getProgress() { return progress; }
    public void setProgress(Integer progress) { this.progress = progress; }
    public BigDecimal getSpent() { return spent; }
    public void setSpent(BigDecimal spent) { this.spent = spent; }
    public String getManager() { return manager; }
    public void setManager(String manager) { this.manager = manager; }
    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }
    public Integer getCompletedTasks() { return completedTasks; }
    public void setCompletedTasks(Integer completedTasks) { this.completedTasks = completedTasks; }
    public Integer getInProgressTasks() { return inProgressTasks; }
    public void setInProgressTasks(Integer inProgressTasks) { this.inProgressTasks = inProgressTasks; }
    public Integer getPendingTasks() { return pendingTasks; }
    public void setPendingTasks(Integer pendingTasks) { this.pendingTasks = pendingTasks; }
    public Integer getOpenIssues() { return openIssues; }
    public void setOpenIssues(Integer openIssues) { this.openIssues = openIssues; }
    public Integer getCriticalIssues() { return criticalIssues; }
    public void setCriticalIssues(Integer criticalIssues) { this.criticalIssues = criticalIssues; }
    public String getClientName() { return clientName; }
    public void setClientName(String clientName) { this.clientName = clientName; }
}


