package com.se2030.backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "task")
public class Task {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "task_id")
    private Long taskId;

    @NotBlank
    @Size(max = 150)
    @Column(name = "title", nullable = false)
    private String title;

    @Size(max = 1000)
    @Column(name = "description")
    private String description;

    @Size(max = 20)
    @Column(name = "priority")
    private String priority; // LOW, MEDIUM, HIGH

    @Size(max = 20)
    @Column(name = "status")
    private String status; // TODO, IN_PROGRESS, DONE

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "due_date")
    private LocalDate dueDate;

    @Column(name = "created_date")
    private LocalDateTime createdDate;

    @Column(name = "updated_date")
    private LocalDateTime updatedDate;

    @Column(name = "progress_percent")
    private Integer progressPercent; // 0-100

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    public Task() {
        this.createdDate = LocalDateTime.now();
        this.updatedDate = LocalDateTime.now();
        this.status = "TODO";
        this.priority = "MEDIUM";
    }

    public Long getTaskId() { return taskId; }
    public void setTaskId(Long taskId) { this.taskId = taskId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; this.updatedDate = LocalDateTime.now(); }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; this.updatedDate = LocalDateTime.now(); }

    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; this.updatedDate = LocalDateTime.now(); }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; this.updatedDate = LocalDateTime.now(); }

    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; this.updatedDate = LocalDateTime.now(); }

    public LocalDate getDueDate() { return dueDate; }
    public void setDueDate(LocalDate dueDate) { this.dueDate = dueDate; this.updatedDate = LocalDateTime.now(); }

    public LocalDateTime getCreatedDate() { return createdDate; }
    public void setCreatedDate(LocalDateTime createdDate) { this.createdDate = createdDate; }

    public LocalDateTime getUpdatedDate() { return updatedDate; }
    public void setUpdatedDate(LocalDateTime updatedDate) { this.updatedDate = updatedDate; }

    public Project getProject() { return project; }
    public void setProject(Project project) { this.project = project; this.updatedDate = LocalDateTime.now(); }

    public Integer getProgressPercent() { return progressPercent; }
    public void setProgressPercent(Integer progressPercent) { this.progressPercent = progressPercent; this.updatedDate = LocalDateTime.now(); }

    @PreUpdate
    public void preUpdate() { this.updatedDate = LocalDateTime.now(); }
}


