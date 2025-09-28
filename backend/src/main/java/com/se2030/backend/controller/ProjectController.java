package com.se2030.backend.controller;

import com.se2030.backend.model.Project;
import com.se2030.backend.dto.ProjectDashboardDTO;
import com.se2030.backend.service.ProjectService;
import com.se2030.backend.service.TaskService;
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
@RequestMapping("/api/projects")
@CrossOrigin(origins = "*")
public class ProjectController {

    @Autowired
    private ProjectService projectService;

    @PostMapping
    public ResponseEntity<Project> create(@Valid @RequestBody Project project) {
        Project saved = projectService.create(project);
        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<Project>> getAll() {
        return new ResponseEntity<>(projectService.getAll(), HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Project> getById(@PathVariable("id") Long id) {
        Optional<Project> project = projectService.getById(id);
        return project.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Project> update(@PathVariable("id") Long id, @Valid @RequestBody Project project) {
        try {
            Project updated = projectService.update(id, project);
            return new ResponseEntity<>(updated, HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable("id") Long id) {
        projectService.delete(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }


    @GetMapping("/{id}/dashboard")
    public ResponseEntity<ProjectDashboardDTO> getDashboard(@PathVariable("id") Long id) {
        Optional<ProjectDashboardDTO> dto = projectService.getDashboard(id);
        return dto.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }
}



