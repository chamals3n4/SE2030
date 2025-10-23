package com.se2030.backend.controller;

import com.se2030.backend.model.Issue;
import com.se2030.backend.service.IssueService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/issues")
@CrossOrigin(origins = "*")
public class IssueController {

    @Autowired
    private IssueService issueService;

    @PostMapping
    public ResponseEntity<Issue> create(@Valid @RequestBody Issue issue) {
        Issue saved = issueService.create(issue);
        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }

    @PostMapping("/create")
    public ResponseEntity<Issue> createForProject(@RequestParam("projectId") Long projectId, @RequestBody Issue issue) {
        com.se2030.backend.model.Project ref = new com.se2030.backend.model.Project();
        ref.setProjectId(projectId);
        issue.setProject(ref);
        Issue saved = issueService.create(issue);
        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<Issue>> getAll() {
        return new ResponseEntity<>(issueService.getAll(), HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Issue> getById(@PathVariable("id") Long id) {
        Optional<Issue> issue = issueService.getById(id);
        return issue.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Issue> update(@PathVariable("id") Long id, @Valid @RequestBody Issue issue) {
        try {
            Issue updated = issueService.update(id, issue);
            return new ResponseEntity<>(updated, HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable("id") Long id) {
        issueService.delete(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @GetMapping("/by-project/{projectId}")
    public ResponseEntity<List<Issue>> byProject(@PathVariable("projectId") Long projectId) {
        return new ResponseEntity<>(issueService.byProject(projectId), HttpStatus.OK);
    }

    @PostMapping("/{id}/assign")
    public ResponseEntity<Issue> assignIssue(@PathVariable("id") Long issueId, @RequestParam Long employeeId) {
        try {
            Issue updatedIssue = issueService.assignIssue(issueId, employeeId);
            return new ResponseEntity<>(updatedIssue, HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @PostMapping("/{id}/close")
    public ResponseEntity<Issue> closeIssue(@PathVariable("id") Long issueId, 
                                          @RequestParam Long employeeId, 
                                          @RequestParam(required = false) String notes) {
        try {
            Issue updatedIssue = issueService.closeIssue(issueId, employeeId, notes);
            return new ResponseEntity<>(updatedIssue, HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

}


