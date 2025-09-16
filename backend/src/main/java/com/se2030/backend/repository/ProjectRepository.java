package com.se2030.backend.repository;

import com.se2030.backend.model.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {
    List<Project> findByClient_ClientId(Long clientId);
    List<Project> findByStatus(String status);
    List<Project> findByStartDateBetween(LocalDate start, LocalDate end);
    List<Project> findByNameContainingIgnoreCase(String name);

    @Query("SELECT p FROM Project p WHERE LOWER(p.name) LIKE LOWER(CONCAT('%', :q, '%')) OR LOWER(p.description) LIKE LOWER(CONCAT('%', :q, '%'))")
    List<Project> search(@Param("q") String q);
}



