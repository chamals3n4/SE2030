package com.se2030.backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "company_stock")
public class CompanyStock {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "stock_id")
    private Long stockId;

    @NotBlank
    @Size(max = 150)
    @Column(name = "name", nullable = false)
    private String name;

    @Size(max = 1000)
    @Column(name = "description")
    private String description;

    @Size(max = 20)
    @Column(name = "resource_type")
    private String resourceType; // MATERIAL, EQUIPMENT

    @Size(max = 20)
    @Column(name = "unit_of_measure")
    private String unitOfMeasure;

    @Min(value = 0)
    @Column(name = "current_quantity")
    private Integer currentQuantity;

    @Min(value = 0)
    @Column(name = "reorder_level")
    private Integer reorderLevel;

    @DecimalMin(value = "0.0", inclusive = true)
    @Column(name = "unit_cost", precision = 18, scale = 2)
    private BigDecimal unitCost;

    @DecimalMin(value = "0.0", inclusive = true)
    @Column(name = "total_value", precision = 18, scale = 2)
    private BigDecimal totalValue;

    @Size(max = 20)
    @Column(name = "status")
    private String status; // ACTIVE, INACTIVE, DEPLETED


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "supplier_id")
    private Supplier supplier;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "original_resource_id")
    private Resource originalResource;

    public CompanyStock() {
        this.status = "ACTIVE";
        this.currentQuantity = 0;
        this.reorderLevel = 10;
        this.unitCost = BigDecimal.ZERO;
        this.totalValue = BigDecimal.ZERO;
    }

    public Long getStockId() { return stockId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getResourceType() { return resourceType; }
    public void setResourceType(String resourceType) { this.resourceType = resourceType; }

    public String getUnitOfMeasure() { return unitOfMeasure; }
    public void setUnitOfMeasure(String unitOfMeasure) { this.unitOfMeasure = unitOfMeasure; }

    public Integer getCurrentQuantity() { return currentQuantity; }
    public void setCurrentQuantity(Integer currentQuantity) { 
        this.currentQuantity = currentQuantity; 
        calculateTotalValue();
    }

    public Integer getReorderLevel() { return reorderLevel; }
    public void setReorderLevel(Integer reorderLevel) { this.reorderLevel = reorderLevel; }

    public BigDecimal getUnitCost() { return unitCost; }
    public void setUnitCost(BigDecimal unitCost) { 
        this.unitCost = unitCost; 
        calculateTotalValue();
    }

    public BigDecimal getTotalValue() { return totalValue; }
    public void setTotalValue(BigDecimal totalValue) { this.totalValue = totalValue; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }


    public Supplier getSupplier() { return supplier; }
    public void setSupplier(Supplier supplier) { this.supplier = supplier; }

    public Resource getOriginalResource() { return originalResource; }
    public void setOriginalResource(Resource originalResource) { this.originalResource = originalResource; }

    private void calculateTotalValue() {
        if (currentQuantity != null && unitCost != null) {
            this.totalValue = unitCost.multiply(BigDecimal.valueOf(currentQuantity));
        }
    }

}
