package com.se2030.backend.service;

import com.se2030.backend.model.*;
import com.se2030.backend.repository.CompanyStockRepository;
import com.se2030.backend.repository.EquipmentRepository;
import com.se2030.backend.repository.MaterialRepository;
import com.se2030.backend.repository.ProjectRepository;
import com.se2030.backend.repository.SupplierRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
@Transactional
public class InventoryService {

    @Autowired private CompanyStockRepository companyStockRepository;
    @Autowired private MaterialRepository materialRepository;
    @Autowired private EquipmentRepository equipmentRepository;
    @Autowired private ProjectRepository projectRepository;
    @Autowired private SupplierRepository supplierRepository;

    public CompanyStock addFromPurchase(Long supplierId, Long resourceId, String resourceType, Integer quantity, BigDecimal unitCost, String name, String description) {
        CompanyStock stock = new CompanyStock();
        stock.setStatus("ACTIVE");
        stock.setResourceType(resourceType);
        stock.setCurrentQuantity(quantity);

        // Determine original resource and default attributes
        if ("MATERIAL".equalsIgnoreCase(resourceType)) {
            Material material = materialRepository.findById(resourceId).orElse(null);
            if (material != null) {
                stock.setOriginalResource(material);
                if (name == null || name.isBlank()) stock.setName(material.getName()); else stock.setName(name);
                if (description == null) description = "";
                if (description.isBlank() && material.getDescription() != null) stock.setDescription(material.getDescription()); else stock.setDescription(description);
                stock.setUnitOfMeasure(material.getUnitOfMeasure());
                if (unitCost == null) unitCost = material.getPrice();
                // Validation: supplier material must have enough stock
                Integer supplierQty = material.getCurrentStock();
                if (supplierQty == null) supplierQty = 0;
                if (supplierQty < quantity) {
                    throw new IllegalArgumentException("Insufficient supplier stock for material");
                }
                material.setCurrentStock(supplierQty - quantity);
                materialRepository.save(material);
            }
        } else if ("EQUIPMENT".equalsIgnoreCase(resourceType)) {
            Equipment eq = equipmentRepository.findById(resourceId).orElse(null);
            if (eq != null) {
                stock.setOriginalResource(eq);
                if (name == null || name.isBlank()) stock.setName(eq.getName()); else stock.setName(name);
                if (description == null) description = "";
                if (description.isBlank() && eq.getDescription() != null) stock.setDescription(eq.getDescription()); else stock.setDescription(description);
                if (unitCost == null) unitCost = eq.getPrice();
            }
        }

        // Fallbacks if resource not found
        if (stock.getName() == null) stock.setName(name != null ? name : "Item");
        if (stock.getDescription() == null) stock.setDescription(description != null ? description : "");
        if (unitCost == null) unitCost = BigDecimal.ZERO;

        stock.setUnitCost(unitCost);
        stock.setTotalValue(unitCost.multiply(BigDecimal.valueOf(quantity)));

        // Optional supplier relation
        if (supplierId != null) {
            supplierRepository.findById(supplierId).ifPresent(stock::setSupplier);
        }

        return companyStockRepository.save(stock);
    }

    // Removed movement/consume/adjust flows per simplified inventory
}


