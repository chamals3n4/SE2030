package com.se2030.backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

@Entity
@Table(name = "project_allocation")
public class ProjectAllocation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "allocation_id")
    private Long allocationId;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "stock_id", nullable = false)
    private CompanyStock stockItem;

    @Min(1)
    @Column(name = "quantity", nullable = false)
    private Integer quantity;

    public Long getAllocationId() { return allocationId; }

    public Project getProject() { return project; }
    public void setProject(Project project) { this.project = project; }

    public CompanyStock getStockItem() { return stockItem; }
    public void setStockItem(CompanyStock stockItem) { this.stockItem = stockItem; }

    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }
}


