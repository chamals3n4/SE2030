package com.se2030.backend.strategy;

import com.se2030.backend.model.CompanyStock;
import com.se2030.backend.model.Material;
import com.se2030.backend.repository.MaterialRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
public class MaterialProcessingStrategy implements ResourceProcessingStrategy {
    
    @Autowired
    private MaterialRepository materialRepository;
    
    @Override
    public CompanyStock processResource(Long resourceId, Integer quantity, BigDecimal unitCost, String name, String description) {
        Material material = materialRepository.findById(resourceId).orElse(null);
        if (material == null) {
            throw new IllegalArgumentException("Material not found with id: " + resourceId);
        }
        
        // Validate stock availability
        validateStock(quantity, material.getCurrentStock());
        
        // Create company stock entry
        CompanyStock stock = new CompanyStock();
        stock.setStatus("ACTIVE");
        stock.setResourceType("MATERIAL");
        stock.setCurrentQuantity(quantity);
        stock.setOriginalResource(material);
        stock.setName(name != null && !name.isBlank() ? name : material.getName());
        stock.setDescription(description != null ? description : material.getDescription());
        stock.setUnitOfMeasure(material.getUnitOfMeasure());
        stock.setUnitCost(unitCost != null ? unitCost : material.getPrice());
        stock.setTotalValue(stock.getUnitCost().multiply(BigDecimal.valueOf(quantity)));
        
        // Update supplier stock
        material.setCurrentStock(material.getCurrentStock() - quantity);
        materialRepository.save(material);
        
        return stock;
    }
    
    @Override
    public void validateStock(Integer requiredQuantity, Integer availableQuantity) {
        if (availableQuantity == null) availableQuantity = 0;
        if (requiredQuantity > availableQuantity) {
            throw new IllegalArgumentException("Insufficient supplier stock. Required: " + requiredQuantity + ", Available: " + availableQuantity);
        }
    }
    
    @Override
    public String getResourceType() {
        return "MATERIAL";
    }
}
