package com.se2030.backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import java.math.BigDecimal;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Entity
@Table(name = "material")
public class Material extends Resource {

    @NotBlank
    @Size(max = 20)
    @Column(name = "unit_of_measure", nullable = false)
    private String unitOfMeasure; //  KG, L, UNIT, M3

    @Column(name = "current_stock")
    private Integer currentStock;

    @DecimalMin(value = "0.0", inclusive = true)
    @Column(name = "price", precision = 18, scale = 2)
    private BigDecimal price;

    public String getUnitOfMeasure() { return unitOfMeasure; }
    public void setUnitOfMeasure(String unitOfMeasure) { this.unitOfMeasure = unitOfMeasure; }

    public Integer getCurrentStock() { return currentStock; }
    public void setCurrentStock(Integer currentStock) { this.currentStock = currentStock; }

    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }
}


