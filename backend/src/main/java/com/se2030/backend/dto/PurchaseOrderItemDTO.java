package com.se2030.backend.dto;

import java.math.BigDecimal;

public class PurchaseOrderItemDTO {
    private Long resourceId;
    private String resourceType; // MATERIAL or EQUIPMENT
    private Integer quantity;
    private BigDecimal unitPrice;

    public Long getResourceId() { return resourceId; }
    public void setResourceId(Long resourceId) { this.resourceId = resourceId; }

    public String getResourceType() { return resourceType; }
    public void setResourceType(String resourceType) { this.resourceType = resourceType; }

    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }

    public BigDecimal getUnitPrice() { return unitPrice; }
    public void setUnitPrice(BigDecimal unitPrice) { this.unitPrice = unitPrice; }
}


