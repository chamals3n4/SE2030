package com.se2030.backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "project")
public class Project {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "project_id")
    private Long projectId;

    @NotBlank(message = "Project name is required")
    @Size(max = 150)
    @Column(name = "name", nullable = false)
    private String name;

    @Size(max = 1000)
    @Column(name = "description")
    private String description;

    @Size(max = 255)
    @Column(name = "location")
    private String location;

    @DecimalMin(value = "0.0", inclusive = true)
    @Column(name = "budget", precision = 18, scale = 2)
    private BigDecimal budget;

    @Size(max = 30)
    @Column(name = "status")
    private String status;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "planned_end_date")
    private LocalDate plannedEndDate;

    @Column(name = "created_date")
    private LocalDateTime createdDate;

    @Column(name = "updated_date")
    private LocalDateTime updatedDate;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "client_id", nullable = false)
    private Client client;

    public Project() {
        this.createdDate = LocalDateTime.now();
        this.updatedDate = LocalDateTime.now();
        this.status = "PLANNED";
    }

    public Long getProjectId() { return projectId; }
    public void setProjectId(Long projectId) { this.projectId = projectId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; this.updatedDate = LocalDateTime.now(); }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; this.updatedDate = LocalDateTime.now(); }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; this.updatedDate = LocalDateTime.now(); }

    public BigDecimal getBudget() { return budget; }
    public void setBudget(BigDecimal budget) { this.budget = budget; this.updatedDate = LocalDateTime.now(); }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; this.updatedDate = LocalDateTime.now(); }

    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; this.updatedDate = LocalDateTime.now(); }

    public LocalDate getPlannedEndDate() { return plannedEndDate; }
    public void setPlannedEndDate(LocalDate plannedEndDate) { this.plannedEndDate = plannedEndDate; this.updatedDate = LocalDateTime.now(); }

    public LocalDateTime getCreatedDate() { return createdDate; }
    public void setCreatedDate(LocalDateTime createdDate) { this.createdDate = createdDate; }

    public LocalDateTime getUpdatedDate() { return updatedDate; }
    public void setUpdatedDate(LocalDateTime updatedDate) { this.updatedDate = updatedDate; }

    public Client getClient() { return client; }
    public void setClient(Client client) { this.client = client; this.updatedDate = LocalDateTime.now(); }

    @PreUpdate
    public void preUpdate() { this.updatedDate = LocalDateTime.now(); }
}



