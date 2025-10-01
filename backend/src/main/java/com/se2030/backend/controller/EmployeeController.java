package com.se2030.backend.controller;

import com.se2030.backend.model.Employee;
import com.se2030.backend.service.EmployeeService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/employees")
@CrossOrigin(origins = "*")
public class EmployeeController {

    @Autowired
    private EmployeeService employeeService;

    //Create new employee profile
    @PostMapping
    public ResponseEntity<Employee> createEmployee(@Valid @RequestBody Employee employee) {
        try {
            Employee savedEmployee = employeeService.createEmployee(employee);
            return new ResponseEntity<>(savedEmployee, HttpStatus.CREATED);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(null, HttpStatus.BAD_REQUEST);
        }
    }

    //View all profiles
    @GetMapping
    public ResponseEntity<List<Employee>> getAllEmployees() {
        List<Employee> employees = employeeService.getAllEmployees();
        return new ResponseEntity<>(employees, HttpStatus.OK);
    }

    //View employee by ID
    @GetMapping("/{id}")
    public ResponseEntity<Employee> getEmployeeById(@PathVariable("id") Long employeeId) {
        Optional<Employee> employee = employeeService.getEmployeeById(employeeId);
        return employee.map(e -> new ResponseEntity<>(e, HttpStatus.OK))
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    //Update profiles
    @PutMapping("/{id}")
    public ResponseEntity<Employee> updateEmployee(@PathVariable("id") Long employeeId,
                                                   @Valid @RequestBody Employee employee) {
        try {
            Employee updatedEmployee = employeeService.updateEmployee(employeeId, employee);
            return new ResponseEntity<>(updatedEmployee, HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
        }
    }

    //Delete employee profiles
    @DeleteMapping("/{id}")
    public ResponseEntity<HttpStatus> deleteEmployee(@PathVariable("id") Long employeeId) {
        try {
            employeeService.deleteEmployee(employeeId);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<Employee>> getEmployeesByStatus(@PathVariable("status") String status) {
        List<Employee> employees = employeeService.getEmployeesByStatus(status);
        return new ResponseEntity<>(employees, HttpStatus.OK);
    }

    //Gets all active employees
    @GetMapping("/active")
    public ResponseEntity<List<Employee>> getActiveEmployees() {
        List<Employee> employees = employeeService.getActiveEmployees();
        return new ResponseEntity<>(employees, HttpStatus.OK);
    }

    //Gets employees as for their job roles
    @GetMapping("/role/{role}")
    public ResponseEntity<List<Employee>> getEmployeesByRole(@PathVariable("role") String role) {
        List<Employee> employees = employeeService.getEmployeesByRole(role);
        return new ResponseEntity<>(employees, HttpStatus.OK);
    }

    @GetMapping("/search")
    public ResponseEntity<List<Employee>> searchEmployees(@RequestParam("q") String search) {
        List<Employee> employees = employeeService.searchEmployees(search);
        return new ResponseEntity<>(employees, HttpStatus.OK);
    }

    @PostMapping("/{id}/activate")
    public ResponseEntity<Employee> activate(@PathVariable("id") Long id) {
        return employeeService.getEmployeeById(id)
                .map(e -> {
                    e.setStatus("ACTIVE");
                    Employee updated = employeeService.updateEmployee(id, e);
                    return new ResponseEntity<>(updated, HttpStatus.OK);
                })
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @PostMapping("/{id}/deactivate")
    public ResponseEntity<Employee> deactivate(@PathVariable("id") Long id) {
        return employeeService.getEmployeeById(id)
                .map(e -> {
                    e.setStatus("INACTIVE");
                    Employee updated = employeeService.updateEmployee(id, e);
                    return new ResponseEntity<>(updated, HttpStatus.OK);
                })
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }
}