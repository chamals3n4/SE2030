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
    public ResponseEntity<Issue> createForProject(@RequestParam("projectId") Long projectId, @Valid @RequestBody Issue issue) {
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

    @GetMapping("/status/{status}")
    public ResponseEntity<List<Issue>> byStatus(@PathVariable("status") String status) {
        return new ResponseEntity<>(issueService.byStatus(status), HttpStatus.OK);
    }

    @GetMapping("/severity/{severity}")
    public ResponseEntity<List<Issue>> bySeverity(@PathVariable("severity") String severity) {
        return new ResponseEntity<>(issueService.bySeverity(severity), HttpStatus.OK);
    }

    @GetMapping("/reported-between")
    public ResponseEntity<List<Issue>> reportedBetween(
            @RequestParam("start") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam("end") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end) {
        return new ResponseEntity<>(issueService.reportedBetween(start, end), HttpStatus.OK);
    }

    @GetMapping("/resolved-between")
    public ResponseEntity<List<Issue>> resolvedBetween(
            @RequestParam("start") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam("end") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end) {
        return new ResponseEntity<>(issueService.resolvedBetween(start, end), HttpStatus.OK);
    }

    @GetMapping("/search")
    public ResponseEntity<List<Issue>> search(@RequestParam("q") String q) {
        return new ResponseEntity<>(issueService.search(q), HttpStatus.OK);
    }

    @PostMapping("/{id}/assign")
    public ResponseEntity<Issue> assign(
            @PathVariable("id") Long id,
            @RequestParam Long employeeId) {
        try {
            Issue issue = issueService.getById(id).orElseThrow();
            com.se2030.backend.model.Employee emp = new com.se2030.backend.model.Employee();
            emp.setEmployeeId(employeeId);
            issue.setAssignedTo(emp);
            Issue updated = issueService.update(id, issue);
            return new ResponseEntity<>(updated, HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @PostMapping("/{id}/close")
    public ResponseEntity<Issue> close(
            @PathVariable("id") Long id,
            @RequestParam Long employeeId,
            @RequestParam(required = false) String notes) {
        try {
            Issue issue = issueService.getById(id).orElseThrow();
            com.se2030.backend.model.Employee emp = new com.se2030.backend.model.Employee();
            emp.setEmployeeId(employeeId);
            issue.setClosedBy(emp);
            issue.setResolutionNotes(notes);
            issue.setStatus("CLOSED");
            Issue updated = issueService.update(id, issue);
            return new ResponseEntity<>(updated, HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
}


