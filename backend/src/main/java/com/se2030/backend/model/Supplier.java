package com.se2030.backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;

@Entity
@Table(name = "supplier")
public class Supplier {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "supplier_id")
    private Long supplierId;

    @NotBlank
    @Size(max = 150)
    @Column(name = "company_name", nullable = false)
    private String companyName;

    @Size(max = 100)
    @Column(name = "contact_name")
    private String contactName;

    @Email
    @Size(max = 120)
    @Column(name = "email")
    private String email;

    @Size(max = 20)
    @Column(name = "phone")
    private String phone;

    @Size(max = 255)
    @Column(name = "address")
    private String address;

    @Column(name = "created_date")
    private LocalDateTime createdDate;

    @Column(name = "updated_date")
    private LocalDateTime updatedDate;

    public Supplier() {
        this.createdDate = LocalDateTime.now();
        this.updatedDate = LocalDateTime.now();
    }

    public Long getSupplierId() { return supplierId; }
    public void setSupplierId(Long supplierId) { this.supplierId = supplierId; }

    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; this.updatedDate = LocalDateTime.now(); }

    public String getContactName() { return contactName; }
    public void setContactName(String contactName) { this.contactName = contactName; this.updatedDate = LocalDateTime.now(); }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; this.updatedDate = LocalDateTime.now(); }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; this.updatedDate = LocalDateTime.now(); }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; this.updatedDate = LocalDateTime.now(); }

    public LocalDateTime getCreatedDate() { return createdDate; }
    public void setCreatedDate(LocalDateTime createdDate) { this.createdDate = createdDate; }

    public LocalDateTime getUpdatedDate() { return updatedDate; }
    public void setUpdatedDate(LocalDateTime updatedDate) { this.updatedDate = updatedDate; }

    @PreUpdate
    public void preUpdate() { this.updatedDate = LocalDateTime.now(); }
}


