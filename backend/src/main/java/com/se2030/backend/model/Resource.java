package com.se2030.backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;

@Entity
@Table(name = "resource")
@Inheritance(strategy = InheritanceType.JOINED)
public abstract class Resource {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "resource_id")
    private Long resourceId;

    @NotBlank
    @Size(max = 150)
    @Column(name = "name", nullable = false)
    private String name;

    @Size(max = 1000)
    @Column(name = "description")
    private String description;

    @Size(max = 20)
    @Column(name = "status")
    private String status; // ACTIVE, INACTIVE, MAINTENANCE

    @Column(name = "created_date")
    private LocalDateTime createdDate;

    @Column(name = "updated_date")
    private LocalDateTime updatedDate;

    public Resource() {
        this.createdDate = LocalDateTime.now();
        this.updatedDate = LocalDateTime.now();
        this.status = "ACTIVE";
    }

    public Long getResourceId() { return resourceId; }
    public void setResourceId(Long resourceId) { this.resourceId = resourceId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; this.updatedDate = LocalDateTime.now(); }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; this.updatedDate = LocalDateTime.now(); }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; this.updatedDate = LocalDateTime.now(); }

    public LocalDateTime getCreatedDate() { return createdDate; }
    public void setCreatedDate(LocalDateTime createdDate) { this.createdDate = createdDate; }

    public LocalDateTime getUpdatedDate() { return updatedDate; }
    public void setUpdatedDate(LocalDateTime updatedDate) { this.updatedDate = updatedDate; }

    @PreUpdate
    public void preUpdate() { this.updatedDate = LocalDateTime.now(); }
}


