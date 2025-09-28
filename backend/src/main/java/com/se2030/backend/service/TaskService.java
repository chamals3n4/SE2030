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

    public void delete(Long id) { 
        // first TASKASSIGNMENT
        List<TaskAssignment> assignments = taskAssignmentRepository.findByTask_TaskId(id);
        if (!assignments.isEmpty()) {
            taskAssignmentRepository.deleteAll(assignments);
        }
        // then TASK
        taskRepository.deleteById(id); 
    }

    public List<Task> byProject(Long projectId) { return taskRepository.findByProject_ProjectId(projectId); }

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
}


