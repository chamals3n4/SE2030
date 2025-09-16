package com.se2030.backend.repository;

import com.se2030.backend.model.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByProject_ProjectId(Long projectId);
    List<Task> findByStatus(String status);
    List<Task> findByPriority(String priority);
    List<Task> findByStartDateBetween(LocalDate start, LocalDate end);
    List<Task> findByDueDateBetween(LocalDate start, LocalDate end);
    List<Task> findByTitleContainingIgnoreCase(String title);

    @Query("SELECT t FROM Task t WHERE LOWER(t.title) LIKE LOWER(CONCAT('%', :q, '%')) OR LOWER(t.description) LIKE LOWER(CONCAT('%', :q, '%'))")
    List<Task> search(@Param("q") String q);
}


