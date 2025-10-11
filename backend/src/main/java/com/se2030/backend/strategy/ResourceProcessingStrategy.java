package com.se2030.backend.strategy;

import com.se2030.backend.model.CompanyStock;
import java.math.BigDecimal;

public interface ResourceProcessingStrategy {
    CompanyStock processResource(
        Long resourceId, Integer quantity, 
        BigDecimal unitCost, String name, String description);
    void validateStock(Integer requiredQuantity, Integer availableQuantity);
    String getResourceType();
}



