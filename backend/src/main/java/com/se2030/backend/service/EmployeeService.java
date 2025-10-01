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

    //New employee
    public Employee createEmployee(Employee employee) {
        if (employeeRepository.findByNic(employee.getNic()).isPresent()) {
            throw new RuntimeException("Employee with NIC " + employee.getNic() + " already exists");
        }
        return employeeRepository.save(employee);
    }

    public List<Employee> getAllEmployees() {
        return employeeRepository.findAll();
    }

    public Optional<Employee> getEmployeeById(Long employeeId) {
        return employeeRepository.findById(employeeId);
    }

    public Optional<Employee> getEmployeeByNic(String nic) {
        return employeeRepository.findByNic(nic);
    }

    public Employee updateEmployee(Long employeeId, Employee updatedEmployee) {
        return employeeRepository.findById(employeeId)
                .map(employee -> {
                    employee.setFirstName(updatedEmployee.getFirstName());
                    employee.setLastName(updatedEmployee.getLastName());
                    employee.setRole(updatedEmployee.getRole());
                    employee.setStatus(updatedEmployee.getStatus());
                    employee.setPhone(updatedEmployee.getPhone());
                    employee.setAddress(updatedEmployee.getAddress());
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

    public List<Employee> getEmployeesByStatus(String status) {
        return employeeRepository.findByStatus(status);
    }

    public List<Employee> getActiveEmployees() {
        return employeeRepository.findActiveEmployees();
    }

    public List<Employee> getEmployeesByRole(String role) {
        return employeeRepository.findByRole(role);
    }

    public List<Employee> searchEmployees(String search) {
        return employeeRepository.searchEmployees(search);
    }

    public List<Employee> getEmployeesHiredBetween(LocalDate startDate, LocalDate endDate) {
        return employeeRepository.findByHireDateBetween(startDate, endDate);
    }

    public Long countEmployeesByRole(String role) {
        return employeeRepository.countByRoleAndActive(role);
    }
}