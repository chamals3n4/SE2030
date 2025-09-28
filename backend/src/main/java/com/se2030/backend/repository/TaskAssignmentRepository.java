package com.se2030.backend.repository;

import com.se2030.backend.model.TaskAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface TaskAssignmentRepository extends JpaRepository<TaskAssignment, Long> {
    List<TaskAssignment> findByTask_TaskId(Long taskId);
}


