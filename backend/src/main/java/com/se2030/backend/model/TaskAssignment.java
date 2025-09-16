package com.se2030.backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "task_assignment")
public class TaskAssignment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "assignment_id")
    private Long assignmentId;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "task_id", nullable = false)
    private Task task;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @Size(max = 20)
    @Column(name = "assignment_status")
    private String assignmentStatus; // ASSIGNED, IN_PROGRESS, COMPLETED

    @Column(name = "assigned_date")
    private LocalDate assignedDate;

    @Column(name = "due_date")
    private LocalDate dueDate;

    @Size(max = 500)
    @Column(name = "notes")
    private String notes;

    @Column(name = "created_date")
    private LocalDateTime createdDate;

    @Column(name = "updated_date")
    private LocalDateTime updatedDate;

    public TaskAssignment() {
        this.createdDate = LocalDateTime.now();
        this.updatedDate = LocalDateTime.now();
        this.assignmentStatus = "ASSIGNED";
        this.assignedDate = LocalDate.now();
    }

    public Long getAssignmentId() { return assignmentId; }
    public void setAssignmentId(Long assignmentId) { this.assignmentId = assignmentId; }

    public Task getTask() { return task; }
    public void setTask(Task task) { this.task = task; this.updatedDate = LocalDateTime.now(); }

    public Employee getEmployee() { return employee; }
    public void setEmployee(Employee employee) { this.employee = employee; this.updatedDate = LocalDateTime.now(); }

    public String getAssignmentStatus() { return assignmentStatus; }
    public void setAssignmentStatus(String assignmentStatus) { this.assignmentStatus = assignmentStatus; this.updatedDate = LocalDateTime.now(); }

    public LocalDate getAssignedDate() { return assignedDate; }
    public void setAssignedDate(LocalDate assignedDate) { this.assignedDate = assignedDate; this.updatedDate = LocalDateTime.now(); }

    public LocalDate getDueDate() { return dueDate; }
    public void setDueDate(LocalDate dueDate) { this.dueDate = dueDate; this.updatedDate = LocalDateTime.now(); }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; this.updatedDate = LocalDateTime.now(); }

    public LocalDateTime getCreatedDate() { return createdDate; }
    public void setCreatedDate(LocalDateTime createdDate) { this.createdDate = createdDate; }

    public LocalDateTime getUpdatedDate() { return updatedDate; }
    public void setUpdatedDate(LocalDateTime updatedDate) { this.updatedDate = updatedDate; }

    @PreUpdate
    public void preUpdate() { this.updatedDate = LocalDateTime.now(); }
}


