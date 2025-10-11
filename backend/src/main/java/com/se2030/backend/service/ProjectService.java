package com.se2030.backend.service;

import com.se2030.backend.dto.ProjectDashboardDTO;
import com.se2030.backend.model.Project;
import com.se2030.backend.model.Task;
import com.se2030.backend.model.Issue;
import com.se2030.backend.model.Client;
import com.se2030.backend.repository.TaskRepository;
import com.se2030.backend.repository.IssueRepository;
import com.se2030.backend.repository.ProjectRepository;
import com.se2030.backend.repository.ClientRepository;
import com.se2030.backend.observer.ProjectStatusSubject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class ProjectService {

    @Autowired
    private ProjectRepository projectRepository;
    @Autowired
    private TaskRepository taskRepository;
    @Autowired
    private IssueRepository issueRepository;

    @Autowired
    private ClientRepository clientRepository;
    
    @Autowired
    private ProjectStatusSubject statusSubject;

    public Project create(Project project) {
        if (project.getClient() == null || project.getClient().getClientId() == null) {
            throw new RuntimeException("Client ID is required");
        }

        Long clientId = project.getClient().getClientId();
        Client client = clientRepository.findById(clientId)
                .orElseThrow(() -> new RuntimeException("Client not found with id: " + clientId));

        project.setClient(client);
        Project savedProject = projectRepository.save(project);
        
        // Observer Pattern: Notify client about new project
        statusSubject.notifyStatusChange(savedProject, null, savedProject.getStatus());
        
        return savedProject;
    }

    public List<Project> getAll() {
        return projectRepository.findAll();
    }

    public Optional<Project> getById(Long id) {
        return projectRepository.findById(id);
    }

    public Project update(Long id, Project updated) {
        return projectRepository.findById(id)
                .map(existing -> {
                    String oldStatus = existing.getStatus();
                    existing.setName(updated.getName());
                    existing.setDescription(updated.getDescription());
                    existing.setLocation(updated.getLocation());
                    existing.setBudget(updated.getBudget());
                    existing.setStatus(updated.getStatus());
                    existing.setStartDate(updated.getStartDate());
                    existing.setPlannedEndDate(updated.getPlannedEndDate());
                    existing.setClient(updated.getClient());
                    
                    Project savedProject = projectRepository.save(existing);
                    
                    // Observer Pattern: Notify client about status change
                    if (!oldStatus.equals(updated.getStatus())) {
                        statusSubject.notifyStatusChange(savedProject, oldStatus, updated.getStatus());
                    }
                    
                    return savedProject;
                })
                .orElseThrow(() -> new RuntimeException("Project not found with id: " + id));
    }
    
    // New method specifically for status updates with Observer Pattern
    public Project updateProjectStatus(Long projectId, String newStatus) {
        Project project = projectRepository.findById(projectId)
            .orElseThrow(() -> new RuntimeException("Project not found with id: " + projectId));
        
        String oldStatus = project.getStatus();
        project.setStatus(newStatus);
        Project savedProject = projectRepository.save(project);
        
        // Observer Pattern: Notify client via SMS
        statusSubject.notifyStatusChange(savedProject, oldStatus, newStatus);
        
        return savedProject;
    }

    public void delete(Long id) {
        projectRepository.deleteById(id);
    }


    public Optional<ProjectDashboardDTO> getDashboard(Long projectId) {
        Optional<Project> projectOpt = projectRepository.findById(projectId);
        if (projectOpt.isEmpty()) {
            return Optional.empty();
        }
        Project project = projectOpt.get();

        List<Task> tasks = taskRepository.findByProject_ProjectId(projectId);
        List<Issue> issues = issueRepository.findByProject_ProjectId(projectId);

        int progressAvg = (int) Math.round(tasks.stream()
                .map(t -> t.getProgressPercent() == null ? 0 : t.getProgressPercent())
                .mapToInt(Integer::intValue)
                .average().orElse(0.0));

        int teamSize = (int) tasks.stream()
                .flatMap(t -> t.getProject() != null ? java.util.stream.Stream.of(t.getProject()) : java.util.stream.Stream.empty())
                .count();

        long completedTasks = tasks.stream().filter(t -> "DONE".equalsIgnoreCase(t.getStatus())).count();
        long inProgressTasks = tasks.stream().filter(t -> "IN_PROGRESS".equalsIgnoreCase(t.getStatus())).count();
        long pendingTasks = tasks.stream().filter(t -> !"DONE".equalsIgnoreCase(t.getStatus())).count();

        long openIssues = issues.stream().filter(i -> "OPEN".equalsIgnoreCase(i.getStatus())).count();
        long criticalIssues = issues.stream().filter(i -> "CRITICAL".equalsIgnoreCase(i.getSeverity()) && !"CLOSED".equalsIgnoreCase(i.getStatus())).count();

        ProjectDashboardDTO dto = new ProjectDashboardDTO();
        dto.setProjectId(project.getProjectId());
        dto.setName(project.getName());
        dto.setDescription(project.getDescription());
        dto.setLocation(project.getLocation());
        dto.setBudget(project.getBudget());
        dto.setStartDate(project.getStartDate());
        dto.setEndDate(project.getPlannedEndDate());
        dto.setStatus(project.getStatus());
        dto.setClientName(project.getClient() != null ? project.getClient().getName() : null);
        dto.setTeamSize(teamSize);
        dto.setProgress(progressAvg);
        dto.setSpent(null); 
        dto.setManager(null); 
        dto.setPriority(null);
        dto.setCompletedTasks((int) completedTasks);
        dto.setInProgressTasks((int) inProgressTasks);
        dto.setPendingTasks((int) pendingTasks);
        dto.setOpenIssues((int) openIssues);
        dto.setCriticalIssues((int) criticalIssues);

        return Optional.of(dto);
    }
}



