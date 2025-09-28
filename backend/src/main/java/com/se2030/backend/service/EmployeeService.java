package com.se2030.backend.service;

import com.se2030.backend.model.Employee;
import com.se2030.backend.repository.EmployeeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class EmployeeService {

    @Autowired
    private EmployeeRepository employeeRepository;

    public Employee createEmployee(Employee employee) {
        return employeeRepository.save(employee);
    }

    public List<Employee> getAllEmployees() {
        return employeeRepository.findAll();
    }

    public Optional<Employee> getEmployeeById(Long employeeId) {
        return employeeRepository.findById(employeeId);
    }


    public Employee updateEmployee(Long employeeId, Employee updatedEmployee) {
        return employeeRepository.findById(employeeId)
                .map(employee -> {
                    employee.setName(updatedEmployee.getName());
                    employee.setRole(updatedEmployee.getRole());
                    employee.setStatus(updatedEmployee.getStatus());
                    employee.setPhone(updatedEmployee.getPhone());
                    employee.setAddress(updatedEmployee.getAddress());
                    employee.setNic(updatedEmployee.getNic());
                    employee.setHireDate(updatedEmployee.getHireDate());
                    return employeeRepository.save(employee);
                })
                .orElseThrow(() -> new RuntimeException("Employee not found with id: " + employeeId));
    }

    public void deleteEmployee(Long employeeId) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found with id: " + employeeId));
        employee.setStatus("INACTIVE");
        employeeRepository.save(employee);
    }

}