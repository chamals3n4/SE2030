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

    @NotBlank(message = "Name is required")
    @Size(max = 100, message = "Name must not exceed 100 characters")
    @Column(name = "name", nullable = false)
    private String name;

    @Size(max = 255, message = "Address must not exceed 255 characters")
    @Column(name = "address")
    private String address;



    public Employee() {
        this.status = "ACTIVE";
        this.hireDate = LocalDate.now();
    }

    public Employee(String nic, String name, String role) {
        this();
        this.nic = nic;
        this.name = name;
        this.role = role;
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
    }

    public LocalDate getHireDate() {
        return hireDate;
    }

    public void setHireDate(LocalDate hireDate) {
        this.hireDate = hireDate;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }


    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }



    @Override
    public String toString() {
        return "Employee{" +
                "employeeId=" + employeeId +
                ", nic='" + nic + '\'' +
                ", name='" + name + '\'' +
                ", role='" + role + '\'' +
                ", status='" + status + '\'' +
                ", hireDate=" + hireDate +
                '}';
    }
}