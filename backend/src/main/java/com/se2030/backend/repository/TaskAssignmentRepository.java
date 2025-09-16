package com.se2030.backend.repository;

import com.se2030.backend.model.TaskAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface TaskAssignmentRepository extends JpaRepository<TaskAssignment, Long> {
    List<TaskAssignment> findByTask_TaskId(Long taskId);
    List<TaskAssignment> findByEmployee_EmployeeId(Long employeeId);
    List<TaskAssignment> findByAssignmentStatus(String status);
    List<TaskAssignment> findByAssignedDateBetween(LocalDate start, LocalDate end);
    List<TaskAssignment> findByDueDateBetween(LocalDate start, LocalDate end);
}


