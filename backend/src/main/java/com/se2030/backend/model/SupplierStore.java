package com.se2030.backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;

@Entity
@Table(name = "supplier_store")
public class SupplierStore {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "store_id")
    private Long storeId;

    @NotBlank
    @Size(max = 150)
    @Column(name = "store_name", nullable = false)
    private String storeName;

    @Size(max = 500)
    @Column(name = "description")
    private String description;

    @Size(max = 20)
    @Column(name = "status")
    private String status; // ACTIVE, INACTIVE, SUSPENDED

    @Column(name = "is_online")
    private Boolean isOnline;

    @Column(name = "rating")
    private Double rating;

    @Column(name = "total_sales")
    private Double totalSales;

    @Column(name = "created_date")
    private LocalDateTime createdDate;

    @Column(name = "updated_date")
    private LocalDateTime updatedDate;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "supplier_id", nullable = false)
    private Supplier supplier;

    public SupplierStore() {
        this.createdDate = LocalDateTime.now();
        this.updatedDate = LocalDateTime.now();
        this.status = "ACTIVE";
        this.isOnline = true;
        this.rating = 0.0;
        this.totalSales = 0.0;
    }

    public Long getStoreId() { return storeId; }
    public void setStoreId(Long storeId) { this.storeId = storeId; }

    public String getStoreName() { return storeName; }
    public void setStoreName(String storeName) { this.storeName = storeName; this.updatedDate = LocalDateTime.now(); }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; this.updatedDate = LocalDateTime.now(); }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; this.updatedDate = LocalDateTime.now(); }

    public Boolean getIsOnline() { return isOnline; }
    public void setIsOnline(Boolean isOnline) { this.isOnline = isOnline; this.updatedDate = LocalDateTime.now(); }

    public Double getRating() { return rating; }
    public void setRating(Double rating) { this.rating = rating; this.updatedDate = LocalDateTime.now(); }

    public Double getTotalSales() { return totalSales; }
    public void setTotalSales(Double totalSales) { this.totalSales = totalSales; this.updatedDate = LocalDateTime.now(); }

    public LocalDateTime getCreatedDate() { return createdDate; }
    public void setCreatedDate(LocalDateTime createdDate) { this.createdDate = createdDate; }

    public LocalDateTime getUpdatedDate() { return updatedDate; }
    public void setUpdatedDate(LocalDateTime updatedDate) { this.updatedDate = updatedDate; }

    public Supplier getSupplier() { return supplier; }
    public void setSupplier(Supplier supplier) { this.supplier = supplier; }

    @PreUpdate
    public void preUpdate() { this.updatedDate = LocalDateTime.now(); }
}
