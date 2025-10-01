package com.se2030.backend.service;

import com.se2030.backend.model.Issue;
import com.se2030.backend.repository.IssueRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class IssueService {

    @Autowired
    private IssueRepository issueRepository;

    public Issue create(Issue issue) { return issueRepository.save(issue); }
    public List<Issue> getAll() { return issueRepository.findAll(); }
    public Optional<Issue> getById(Long id) { return issueRepository.findById(id); }

    public Issue update(Long id, Issue updated) {
        return issueRepository.findById(id)
                .map(existing -> {
                    existing.setTitle(updated.getTitle());
                    existing.setDescription(updated.getDescription());
                    existing.setSeverity(updated.getSeverity());
                    existing.setStatus(updated.getStatus());
                    existing.setReportedDate(updated.getReportedDate());
                    existing.setResolvedDate(updated.getResolvedDate());
                    existing.setAttachmentUrl(updated.getAttachmentUrl());
                    existing.setProject(updated.getProject());
                    return issueRepository.save(existing);
                })
                .orElseThrow(() -> new RuntimeException("Issue not found with id: " + id));
    }

    public void delete(Long id) { issueRepository.deleteById(id); }

    public List<Issue> byProject(Long projectId) { return issueRepository.findByProject_ProjectId(projectId); }

    public Issue assignIssue(Long issueId, Long employeeId) {
        return issueRepository.findById(issueId)
                .map(issue -> {
                    com.se2030.backend.model.Employee employee = new com.se2030.backend.model.Employee();
                    employee.setEmployeeId(employeeId);
                    issue.setAssignedTo(employee);
                    return issueRepository.save(issue);
                })
                .orElseThrow(() -> new RuntimeException("Issue not found with id: " + issueId));
    }

    public Issue closeIssue(Long issueId, Long employeeId, String notes) {
        return issueRepository.findById(issueId)
                .map(issue -> {
                    issue.setStatus("CLOSED");
                    issue.setResolvedDate(java.time.LocalDate.now());
                    if (notes != null && !notes.trim().isEmpty()) {
                        issue.setResolutionNotes(notes);
                    }
                    return issueRepository.save(issue);
                })
                .orElseThrow(() -> new RuntimeException("Issue not found with id: " + issueId));
    }
}


