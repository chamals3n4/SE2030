package com.se2030.backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "issue")
public class Issue {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "issue_id")
    private Long issueId;

    @NotBlank
    @Size(max = 150)
    @Column(name = "title", nullable = false)
    private String title;

    @Size(max = 2000)
    @Column(name = "description")
    private String description;

    @Size(max = 20)
    @Column(name = "severity")
    private String severity; // LOW, MEDIUM, HIGH, CRITICAL

    @Size(max = 20)
    @Column(name = "status")
    private String status; // OPEN, IN_PROGRESS, RESOLVED, CLOSED

    @Column(name = "reported_date")
    private LocalDate reportedDate;

    @Column(name = "resolved_date")
    private LocalDate resolvedDate;

    @Size(max = 500)
    @Column(name = "attachment_url")
    private String attachmentUrl;


    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_to")
    private Employee assignedTo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "closed_by")
    private Employee closedBy;

    @Size(max = 1000)
    @Column(name = "resolution_notes")
    private String resolutionNotes;

    public Issue() {
        this.status = "OPEN";
        this.severity = "MEDIUM";
        this.reportedDate = LocalDate.now();
    }

    public Long getIssueId() { return issueId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getSeverity() { return severity; }
    public void setSeverity(String severity) { this.severity = severity; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDate getReportedDate() { return reportedDate; }
    public void setReportedDate(LocalDate reportedDate) { this.reportedDate = reportedDate; }

    public LocalDate getResolvedDate() { return resolvedDate; }
    public void setResolvedDate(LocalDate resolvedDate) { this.resolvedDate = resolvedDate; }

    public String getAttachmentUrl() { return attachmentUrl; }
    public void setAttachmentUrl(String attachmentUrl) { this.attachmentUrl = attachmentUrl; }


    public Project getProject() { return project; }
    public void setProject(Project project) { this.project = project; }

    public Employee getAssignedTo() { return assignedTo; }
    public void setAssignedTo(Employee assignedTo) { this.assignedTo = assignedTo; }

    public Employee getClosedBy() { return closedBy; }
    public void setClosedBy(Employee closedBy) { this.closedBy = closedBy; }

    public String getResolutionNotes() { return resolutionNotes; }
    public void setResolutionNotes(String resolutionNotes) { this.resolutionNotes = resolutionNotes; }

}


