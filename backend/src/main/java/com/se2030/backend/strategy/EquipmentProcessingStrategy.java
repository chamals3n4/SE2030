package com.se2030.backend.strategy;

import com.se2030.backend.model.CompanyStock;
import com.se2030.backend.model.Equipment;
import com.se2030.backend.repository.EquipmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
public class EquipmentProcessingStrategy implements ResourceProcessingStrategy {
    
    @Autowired
    private EquipmentRepository equipmentRepository;
    
    @Override
    public CompanyStock processResource(Long resourceId, Integer quantity, BigDecimal unitCost, String name, String description) {
        Equipment equipment = equipmentRepository.findById(resourceId).orElse(null);
        if (equipment == null) {
            throw new IllegalArgumentException("Equipment not found with id: " + resourceId);
        }
        
        // Equipment doesn't need stock validation like materials
        validateStock(quantity, 1); // Equipment is typically 1 unit
        
        // Create company stock entry
        CompanyStock stock = new CompanyStock();
        stock.setStatus("ACTIVE");
        stock.setResourceType("EQUIPMENT");
        stock.setCurrentQuantity(quantity);
        stock.setOriginalResource(equipment);
        stock.setName(name != null && !name.isBlank() ? name : equipment.getName());
        stock.setDescription(description != null ? description : equipment.getDescription());
        stock.setUnitCost(unitCost != null ? unitCost : equipment.getPrice());
        stock.setTotalValue(stock.getUnitCost().multiply(BigDecimal.valueOf(quantity)));
        
        // Equipment doesn't reduce supplier stock like materials
        // Equipment is typically purchased/rented, not consumed
        
        return stock;
    }
    
    @Override
    public void validateStock(Integer requiredQuantity, Integer availableQuantity) {
        // Equipment validation is different - typically just check if equipment exists
        if (requiredQuantity <= 0) {
            throw new IllegalArgumentException("Invalid quantity for equipment: " + requiredQuantity);
        }
    }
    
    @Override
    public String getResourceType() {
        return "EQUIPMENT";
    }
}
