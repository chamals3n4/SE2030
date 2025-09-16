package com.se2030.backend.service;

import com.se2030.backend.model.Project;
import com.se2030.backend.repository.ProjectRepository;
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

    public Project create(Project project) {
        return projectRepository.save(project);
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
                    existing.setName(updated.getName());
                    existing.setDescription(updated.getDescription());
                    existing.setLocation(updated.getLocation());
                    existing.setBudget(updated.getBudget());
                    existing.setStatus(updated.getStatus());
                    existing.setStartDate(updated.getStartDate());
                    existing.setPlannedEndDate(updated.getPlannedEndDate());
                    existing.setClient(updated.getClient());
                    return projectRepository.save(existing);
                })
                .orElseThrow(() -> new RuntimeException("Project not found with id: " + id));
    }

    public void delete(Long id) {
        projectRepository.deleteById(id);
    }

    public List<Project> findByClient(Long clientId) { return projectRepository.findByClient_ClientId(clientId); }
    public List<Project> findByStatus(String status) { return projectRepository.findByStatus(status); }
    public List<Project> findByStartDateBetween(LocalDate start, LocalDate end) { return projectRepository.findByStartDateBetween(start, end); }
    public List<Project> search(String q) { return projectRepository.search(q); }
}



