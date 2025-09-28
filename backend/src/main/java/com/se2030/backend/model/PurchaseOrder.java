package com.se2030.backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "purchase_order")
public class PurchaseOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "order_id")
    private Long orderId;

    @Size(max = 50)
    @Column(name = "order_number", unique = true)
    private String orderNumber;

    @Size(max = 20)
    @Column(name = "status")
    private String status; // PENDING, CONFIRMED, SHIPPED, DELIVERED, CANCELLED

    @DecimalMin(value = "0.0", inclusive = true)
    @Column(name = "total_amount", precision = 18, scale = 2)
    private BigDecimal totalAmount;

    @Size(max = 1000)
    @Column(name = "notes")
    private String notes;

    @Column(name = "order_date")
    private LocalDateTime orderDate;

    @Column(name = "delivery_date")
    private LocalDateTime deliveryDate;

    @Column(name = "created_date")
    private LocalDateTime createdDate;

    @Column(name = "updated_date")
    private LocalDateTime updatedDate;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "supplier_id", nullable = false)
    private Supplier supplier;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id")
    private Project project;

    @OneToMany(mappedBy = "purchaseOrder", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<PurchaseOrderItem> orderItems;

    public PurchaseOrder() {
        this.createdDate = LocalDateTime.now();
        this.updatedDate = LocalDateTime.now();
        this.status = "PENDING";
        this.orderDate = LocalDateTime.now();
        this.totalAmount = BigDecimal.ZERO;
    }

    public Long getOrderId() { return orderId; }
    public void setOrderId(Long orderId) { this.orderId = orderId; }

    public String getOrderNumber() { return orderNumber; }
    public void setOrderNumber(String orderNumber) { this.orderNumber = orderNumber; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; this.updatedDate = LocalDateTime.now(); }

    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; this.updatedDate = LocalDateTime.now(); }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; this.updatedDate = LocalDateTime.now(); }

    public LocalDateTime getOrderDate() { return orderDate; }
    public void setOrderDate(LocalDateTime orderDate) { this.orderDate = orderDate; }

    public LocalDateTime getDeliveryDate() { return deliveryDate; }
    public void setDeliveryDate(LocalDateTime deliveryDate) { this.deliveryDate = deliveryDate; }

    public LocalDateTime getCreatedDate() { return createdDate; }
    public void setCreatedDate(LocalDateTime createdDate) { this.createdDate = createdDate; }

    public LocalDateTime getUpdatedDate() { return updatedDate; }
    public void setUpdatedDate(LocalDateTime updatedDate) { this.updatedDate = updatedDate; }

    public Supplier getSupplier() { return supplier; }
    public void setSupplier(Supplier supplier) { this.supplier = supplier; }

    public Project getProject() { return project; }
    public void setProject(Project project) { this.project = project; }

    public List<PurchaseOrderItem> getOrderItems() { return orderItems; }
    public void setOrderItems(List<PurchaseOrderItem> orderItems) { this.orderItems = orderItems; }

    @PreUpdate
    public void preUpdate() { this.updatedDate = LocalDateTime.now(); }
}
