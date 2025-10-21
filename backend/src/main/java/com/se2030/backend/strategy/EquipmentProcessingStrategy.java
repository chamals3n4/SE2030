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
        
        validateStock(quantity, 1); 
        
        CompanyStock stock = new CompanyStock();
        stock.setStatus("ACTIVE");
        stock.setResourceType("EQUIPMENT");
        stock.setCurrentQuantity(quantity);
        stock.setOriginalResource(equipment);
        stock.setName(name != null && !name.isBlank() ? name : equipment.getName());
        stock.setDescription(description != null ? description : equipment.getDescription());
        stock.setUnitCost(unitCost != null ? unitCost : equipment.getPrice());
        stock.setTotalValue(stock.getUnitCost().multiply(BigDecimal.valueOf(quantity)));
        
        
        return stock;
    }
    
    @Override
    public void validateStock(Integer requiredQuantity, Integer availableQuantity) {
        if (requiredQuantity <= 0) {
            throw new IllegalArgumentException("Invalid quantity for equipment: " + requiredQuantity);
        }
    }
    
    @Override
    public String getResourceType() {
        return "EQUIPMENT";
    }
}
