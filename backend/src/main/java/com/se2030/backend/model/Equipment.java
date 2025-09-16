package com.se2030.backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

@Entity
@Table(name = "equipment")
public class Equipment extends Resource {

    @Size(max = 50)
    @Column(name = "model")
    private String model;

    @Size(max = 50)
    @Column(name = "equipment_type")
    private String equipmentType; // TODO : add enums

    @Column(name = "warranty_expiry")
    private LocalDate warrantyExpiry;

    public String getModel() { return model; }
    public void setModel(String model) { this.model = model; }

    public String getEquipmentType() { return equipmentType; }
    public void setEquipmentType(String equipmentType) { this.equipmentType = equipmentType; }

    public LocalDate getWarrantyExpiry() { return warrantyExpiry; }
    public void setWarrantyExpiry(LocalDate warrantyExpiry) { this.warrantyExpiry = warrantyExpiry; }
}


