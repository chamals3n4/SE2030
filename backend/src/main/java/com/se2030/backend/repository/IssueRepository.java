package com.se2030.backend.repository;

import com.se2030.backend.model.Issue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface IssueRepository extends JpaRepository<Issue, Long> {
    List<Issue> findByProject_ProjectId(Long projectId);
    List<Issue> findByStatus(String status);
    List<Issue> findBySeverity(String severity);
    List<Issue> findByReportedDateBetween(LocalDate start, LocalDate end);
    List<Issue> findByResolvedDateBetween(LocalDate start, LocalDate end);
    List<Issue> findByTitleContainingIgnoreCase(String title);

    @Query("SELECT i FROM Issue i WHERE LOWER(i.title) LIKE LOWER(CONCAT('%', :q, '%')) OR LOWER(i.description) LIKE LOWER(CONCAT('%', :q, '%'))")
    List<Issue> search(@Param("q") String q);
}


