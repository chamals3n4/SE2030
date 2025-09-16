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
    public List<Issue> byStatus(String status) { return issueRepository.findByStatus(status); }
    public List<Issue> bySeverity(String severity) { return issueRepository.findBySeverity(severity); }
    public List<Issue> reportedBetween(LocalDate start, LocalDate end) { return issueRepository.findByReportedDateBetween(start, end); }
    public List<Issue> resolvedBetween(LocalDate start, LocalDate end) { return issueRepository.findByResolvedDateBetween(start, end); }
    public List<Issue> search(String q) { return issueRepository.search(q); }
}


