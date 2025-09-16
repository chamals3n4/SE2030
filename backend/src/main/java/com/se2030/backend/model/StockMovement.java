package com.se2030.backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;

@Entity
@Table(name = "stock_movement")
public class StockMovement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "movement_id")
    private Long movementId;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "resource_id", nullable = false)
    private Resource resource;

    @Size(max = 20)
    @Column(name = "type")
    private String type; // RECEIVE, CONSUME, ADJUST

    @Min(1)
    @Column(name = "quantity")
    private Integer quantity;

    @Size(max = 20)
    @Column(name = "ref_type")
    private String refType; // PO, TASK

    @Column(name = "ref_id")
    private Long refId;

    @Column(name = "created_date")
    private LocalDateTime createdDate;

    @Size(max = 255)
    @Column(name = "notes")
    private String notes;

    public StockMovement() {
        this.createdDate = LocalDateTime.now();
    }

    public Long getMovementId() { return movementId; }
    public void setMovementId(Long movementId) { this.movementId = movementId; }

    public Resource getResource() { return resource; }
    public void setResource(Resource resource) { this.resource = resource; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }

    public String getRefType() { return refType; }
    public void setRefType(String refType) { this.refType = refType; }

    public Long getRefId() { return refId; }
    public void setRefId(Long refId) { this.refId = refId; }

    public LocalDateTime getCreatedDate() { return createdDate; }
    public void setCreatedDate(LocalDateTime createdDate) { this.createdDate = createdDate; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}


