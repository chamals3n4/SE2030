package com.se2030.backend.service;

import com.se2030.backend.model.Task;
import com.se2030.backend.model.TaskAssignment;
import com.se2030.backend.repository.TaskRepository;
import com.se2030.backend.repository.TaskAssignmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class TaskService {

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private TaskAssignmentRepository taskAssignmentRepository;

    public Task create(Task task) { return taskRepository.save(task); }
    public List<Task> getAll() { return taskRepository.findAll(); }
    public Optional<Task> getById(Long id) { return taskRepository.findById(id); }

    public Task update(Long id, Task updated) {
        return taskRepository.findById(id)
                .map(existing -> {
                    existing.setTitle(updated.getTitle());
                    existing.setDescription(updated.getDescription());
                    existing.setPriority(updated.getPriority());
                    existing.setStatus(updated.getStatus());
                    existing.setStartDate(updated.getStartDate());
                    existing.setDueDate(updated.getDueDate());
                    existing.setProject(updated.getProject());
                    return taskRepository.save(existing);
                })
                .orElseThrow(() -> new RuntimeException("Task not found with id: " + id));
    }

    public void delete(Long id) { taskRepository.deleteById(id); }

    public List<Task> byProject(Long projectId) { return taskRepository.findByProject_ProjectId(projectId); }
    public List<Task> byStatus(String status) { return taskRepository.findByStatus(status); }
    public List<Task> byPriority(String priority) { return taskRepository.findByPriority(priority); }
    public List<Task> startBetween(LocalDate start, LocalDate end) { return taskRepository.findByStartDateBetween(start, end); }
    public List<Task> dueBetween(LocalDate start, LocalDate end) { return taskRepository.findByDueDateBetween(start, end); }
    public List<Task> search(String q) { return taskRepository.search(q); }

    public TaskAssignment createAssignment(TaskAssignment assignment) { return taskAssignmentRepository.save(assignment); }
    public List<TaskAssignment> getAllAssignments() { return taskAssignmentRepository.findAll(); }
    public Optional<TaskAssignment> getAssignmentById(Long id) { return taskAssignmentRepository.findById(id); }
    public TaskAssignment updateAssignment(Long id, TaskAssignment updated) {
        return taskAssignmentRepository.findById(id)
                .map(existing -> {
                    existing.setTask(updated.getTask());
                    existing.setEmployee(updated.getEmployee());
                    existing.setAssignmentStatus(updated.getAssignmentStatus());
                    existing.setAssignedDate(updated.getAssignedDate());
                    existing.setDueDate(updated.getDueDate());
                    existing.setNotes(updated.getNotes());
                    return taskAssignmentRepository.save(existing);
                })
                .orElseThrow(() -> new RuntimeException("Task assignment not found with id: " + id));
    }
    public void deleteAssignment(Long id) { taskAssignmentRepository.deleteById(id); }
    public List<TaskAssignment> assignmentsByTask(Long taskId) { return taskAssignmentRepository.findByTask_TaskId(taskId); }
    public List<TaskAssignment> assignmentsByEmployee(Long employeeId) { return taskAssignmentRepository.findByEmployee_EmployeeId(employeeId); }
    public List<TaskAssignment> assignmentsByStatus(String status) { return taskAssignmentRepository.findByAssignmentStatus(status); }
    public List<TaskAssignment> assignmentsAssignedBetween(java.time.LocalDate start, java.time.LocalDate end) { return taskAssignmentRepository.findByAssignedDateBetween(start, end); }
    public List<TaskAssignment> assignmentsDueBetween(java.time.LocalDate start, java.time.LocalDate end) { return taskAssignmentRepository.findByDueDateBetween(start, end); }
}


