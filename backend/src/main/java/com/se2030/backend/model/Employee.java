package com.se2030.backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "employee")
public class Employee {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "employee_id")
    private Long employeeId;

    @NotBlank(message = "NIC is required")
    @Size(max = 12, message = "NIC must not exceed 12 characters")
    @Column(name = "nic", unique = true, nullable = false)
    private String nic;

    @Column(name = "hire_date")
    private LocalDate hireDate;

    @Size(max = 20, message = "Status must not exceed 20 characters")
    @Column(name = "status")
    private String status;

    @Size(max = 15, message = "Phone must not exceed 15 characters")
    @Column(name = "phone")
    private String phone;

    @Size(max = 50, message = "Role must not exceed 50 characters")
    @Column(name = "role")
    private String role;

    @NotBlank(message = "First name is required")
    @Size(max = 50, message = "First name must not exceed 50 characters")
    @Column(name = "first_name", nullable = false)
    private String firstName;

    @NotBlank(message = "Last name is required")
    @Size(max = 50, message = "Last name must not exceed 50 characters")
    @Column(name = "last_name", nullable = false)
    private String lastName;

    @Size(max = 100, message = "Name must not exceed 100 characters")
    @Column(name = "name")
    private String name;

    @Size(max = 255, message = "Address must not exceed 255 characters")
    @Column(name = "address")
    private String address;

    @Column(name = "created_date")
    private LocalDateTime createdDate;

    @Column(name = "updated_date")
    private LocalDateTime updatedDate;


    public Employee() {
        this.createdDate = LocalDateTime.now();
        this.updatedDate = LocalDateTime.now();
        this.status = "ACTIVE";
        this.hireDate = LocalDate.now();
    }

    public Employee(String nic, String firstName, String lastName, String role) {
        this();
        this.nic = nic;
        this.firstName = firstName;
        this.lastName = lastName;
        this.role = role;
        this.name = firstName + " " + lastName;
    }

    public Long getEmployeeId() {
        return employeeId;
    }

    public void setEmployeeId(Long employeeId) {
        this.employeeId = employeeId;
    }

    public String getNic() {
        return nic;
    }

    public void setNic(String nic) {
        this.nic = nic;
        this.updatedDate = LocalDateTime.now();
    }

    public LocalDate getHireDate() {
        return hireDate;
    }

    public void setHireDate(LocalDate hireDate) {
        this.hireDate = hireDate;
        this.updatedDate = LocalDateTime.now();
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
        this.updatedDate = LocalDateTime.now();
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
        this.updatedDate = LocalDateTime.now();
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
        this.updatedDate = LocalDateTime.now();
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
        this.name = firstName + " " + (lastName != null ? lastName : "");
        this.updatedDate = LocalDateTime.now();
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
        this.name = (firstName != null ? firstName : "") + " " + lastName;
        this.updatedDate = LocalDateTime.now();
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
        this.updatedDate = LocalDateTime.now();
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
        this.updatedDate = LocalDateTime.now();
    }

    public LocalDateTime getCreatedDate() {
        return createdDate;
    }

    public void setCreatedDate(LocalDateTime createdDate) {
        this.createdDate = createdDate;
    }

    public LocalDateTime getUpdatedDate() {
        return updatedDate;
    }

    public void setUpdatedDate(LocalDateTime updatedDate) {
        this.updatedDate = updatedDate;
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedDate = LocalDateTime.now();
        if (firstName != null && lastName != null) {
            this.name = firstName + " " + lastName;
        }
    }

    @PrePersist
    public void prePersist() {
        if (firstName != null && lastName != null) {
            this.name = firstName + " " + lastName;
        }
    }

    @Override
    public String toString() {
        return "Employee{" +
                "employeeId=" + employeeId +
                ", nic='" + nic + '\'' +
                ", firstName='" + firstName + '\'' +
                ", lastName='" + lastName + '\'' +
                ", role='" + role + '\'' +
                ", status='" + status + '\'' +
                ", hireDate=" + hireDate +
                '}';
    }
}