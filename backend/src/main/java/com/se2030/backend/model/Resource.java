package com.se2030.backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;

@Entity
@Table(name = "resource")
@Inheritance(strategy = InheritanceType.JOINED)
public abstract class Resource {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "resource_id")
    private Long resourceId;

    @NotBlank
    @Size(max = 150)
    @Column(name = "name", nullable = false)
    private String name;

    @Size(max = 1000)
    @Column(name = "description")
    private String description;

    @Size(max = 20)
    @Column(name = "status")
    private String status; // ACTIVE, INACTIVE, MAINTENANCE


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "preferred_supplier_id")
    private Supplier preferredSupplier;

    @Column(name = "reorder_level")
    private Integer reorderLevel; // Minimum stock level before reordering

    @Column(name = "reorder_quantity")
    private Integer reorderQuantity; // Standard quantity to reorder

    public Resource() {
        this.status = "ACTIVE";
    }

    public Long getResourceId() { return resourceId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }


    public Supplier getPreferredSupplier() { return preferredSupplier; }
    public void setPreferredSupplier(Supplier preferredSupplier) { this.preferredSupplier = preferredSupplier; }

    public Integer getReorderLevel() { return reorderLevel; }
    public void setReorderLevel(Integer reorderLevel) { this.reorderLevel = reorderLevel; }

    public Integer getReorderQuantity() { return reorderQuantity; }
    public void setReorderQuantity(Integer reorderQuantity) { this.reorderQuantity = reorderQuantity; }

}


