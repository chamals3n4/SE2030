package com.se2030.backend.controller;

import com.se2030.backend.model.Task;
import com.se2030.backend.model.TaskAssignment;
import com.se2030.backend.service.TaskService;
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
@RequestMapping("/api/tasks")
@CrossOrigin(origins = "*")
public class TaskController {

    @Autowired
    private TaskService taskService;
    @Autowired
    private TaskService taskAssignmentService;

    @PostMapping
    public ResponseEntity<Task> create(@Valid @RequestBody Task task) {
        Task saved = taskService.create(task);
        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }

    @PostMapping("/create")
    public ResponseEntity<Task> createForProject(@RequestParam("projectId") Long projectId, @Valid @RequestBody Task task) {
        com.se2030.backend.model.Project ref = new com.se2030.backend.model.Project();
        ref.setProjectId(projectId);
        task.setProject(ref);
        Task saved = taskService.create(task);
        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<Task>> getAll() {
        return new ResponseEntity<>(taskService.getAll(), HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Task> getById(@PathVariable("id") Long id) {
        Optional<Task> task = taskService.getById(id);
        return task.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Task> update(@PathVariable("id") Long id, @Valid @RequestBody Task task) {
        try {
            Task updated = taskService.update(id, task);
            return new ResponseEntity<>(updated, HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable("id") Long id) {
        taskService.delete(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @GetMapping("/by-project/{projectId}")
    public ResponseEntity<List<Task>> byProject(@PathVariable("projectId") Long projectId) {
        return new ResponseEntity<>(taskService.byProject(projectId), HttpStatus.OK);
    }


    // -------- TA (merged) --------
    @GetMapping("/{taskId}/assignments")
    public ResponseEntity<List<TaskAssignment>> listAssignments(@PathVariable("taskId") Long taskId) {
        return new ResponseEntity<>(taskAssignmentService.assignmentsByTask(taskId), HttpStatus.OK);
    }

    @PostMapping("/{taskId}/assignments")
    public ResponseEntity<TaskAssignment> createAssignment(
            @PathVariable("taskId") Long taskId,
            @RequestParam Long employeeId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) java.time.LocalDate dueDate,
            @RequestParam(required = false) String notes) {
        TaskAssignment ta = new TaskAssignment();
        Task taskRef = new Task();
        taskRef.setTaskId(taskId);
        ta.setTask(taskRef);
        
        // Create a proper Employee reference with the ID
        com.se2030.backend.model.Employee empRef = new com.se2030.backend.model.Employee();
        empRef.setEmployeeId(employeeId);
        
        ta.setEmployee(empRef);
        if (status != null) ta.setAssignmentStatus(status);
        if (dueDate != null) ta.setDueDate(dueDate);
        if (notes != null) ta.setNotes(notes);
        TaskAssignment saved = taskAssignmentService.createAssignment(ta);
        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }

    @GetMapping("/{taskId}/assignments/{assignmentId}")
    public ResponseEntity<TaskAssignment> getAssignment(@PathVariable Long taskId, @PathVariable Long assignmentId) {
        return taskAssignmentService.getAssignmentById(assignmentId)
                .map(a -> new ResponseEntity<>(a, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @PutMapping("/{taskId}/assignments/{assignmentId}")
    public ResponseEntity<TaskAssignment> updateAssignment(
            @PathVariable Long taskId, @PathVariable Long assignmentId,
            @Valid @RequestBody TaskAssignment body) {
        try {
            body.setTask(new Task()); body.getTask().setTaskId(taskId);
            TaskAssignment updated = taskAssignmentService.updateAssignment(assignmentId, body);
            return new ResponseEntity<>(updated, HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @DeleteMapping("/{taskId}/assignments/{assignmentId}")
    public ResponseEntity<Void> deleteAssignment(@PathVariable Long taskId, @PathVariable Long assignmentId) {
        taskAssignmentService.deleteAssignment(assignmentId);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}


