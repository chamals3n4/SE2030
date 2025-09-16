package com.se2030.backend.repository;

import com.se2030.backend.model.Employee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, Long> {


    Optional<Employee> findByNic(String nic);
    List<Employee> findByStatus(String status);
    List<Employee> findByRole(String role);
    List<Employee> findByHireDateBetween(LocalDate startDate, LocalDate endDate);
    List<Employee> findByNameContainingIgnoreCase(String name);

    @Query("SELECT e FROM Employee e WHERE e.status = 'ACTIVE'")
    List<Employee> findActiveEmployees();

    @Query("SELECT e FROM Employee e WHERE " +
            "LOWER(e.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(e.role) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "e.nic LIKE CONCAT('%', :search, '%')")
    List<Employee> searchEmployees(@Param("search") String search);

    @Query("SELECT COUNT(e) FROM Employee e WHERE e.role = :role AND e.status = 'ACTIVE'")
    Long countByRoleAndActive(@Param("role") String role);
}