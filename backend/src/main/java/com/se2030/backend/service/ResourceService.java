package com.se2030.backend.service;

import com.se2030.backend.model.Equipment;
import com.se2030.backend.model.Material;
import com.se2030.backend.model.Resource;
import com.se2030.backend.model.CompanyStock;
import com.se2030.backend.model.Supplier;
import com.se2030.backend.repository.ResourceRepository;
import com.se2030.backend.repository.SupplierRepository;
import com.se2030.backend.repository.CompanyStockRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class ResourceService {

    @Autowired
    private ResourceRepository resourceRepository;

    @Autowired
    private SupplierRepository supplierRepository;

    @Autowired
    private CompanyStockRepository companyStockRepository;

    public Material createMaterial(Material material) { return resourceRepository.save(material); }
    public List<Material> getAllMaterials() { return resourceRepository.findAll(); }
    public Optional<Material> getMaterialById(Long id) { return resourceRepository.findById(id); }
    public Material updateMaterial(Long id, Material updated) {
        return resourceRepository.findById(id)
                .map(existing -> {
                    existing.setName(updated.getName());
                    existing.setDescription(updated.getDescription());
                    existing.setStatus(updated.getStatus());
                    existing.setUnitOfMeasure(updated.getUnitOfMeasure());
                    existing.setCurrentStock(updated.getCurrentStock());
                    existing.setPreferredSupplier(updated.getPreferredSupplier());
                    existing.setReorderLevel(updated.getReorderLevel());
                    existing.setReorderQuantity(updated.getReorderQuantity());
                    existing.setPrice(updated.getPrice());
                    return resourceRepository.save(existing);
                })
                .orElseThrow(() -> new RuntimeException("Material not found with id: " + id));
    }
    public void deleteMaterial(Long id) { 
        Optional<Material> material = resourceRepository.findById(id);
        if (material.isEmpty()) {
            throw new RuntimeException("Material not found with id: " + id);
        }
        
        List<com.se2030.backend.model.StockMovement> stockMovements = resourceRepository.findStockMovementsByResource(id);
        if (!stockMovements.isEmpty()) {
            throw new RuntimeException("Cannot delete material: " + stockMovements.size() + " stock movement records exist. Please archive the material instead or contact administrator to remove stock history.");
        }
        
        List<com.se2030.backend.model.ProcurementOrder> orders = supplierRepository.findProcurementOrdersByResource(id);
        if (!orders.isEmpty()) {
            throw new RuntimeException("Cannot delete material: " + orders.size() + " procurement order records exist. Please complete or cancel all orders first.");
        }
        
        resourceRepository.deleteById(id); 
    }

    public Equipment createEquipment(Equipment equipment) { 
        // Equipment needs to be saved through a different repository or approach
        // For now, we'll throw an exception as this method is not used
        throw new RuntimeException("Equipment creation not supported in this implementation");
    }
    public List<Equipment> getAllEquipment() { return resourceRepository.findAllEquipment(); }
    public Optional<Equipment> getEquipmentById(Long id) { 
        // This method is not used, so we'll return empty
        return Optional.empty();
    }
    public Equipment updateEquipment(Long id, Equipment updated) {
        // This method is not used, so we'll throw an exception
        throw new RuntimeException("Equipment update not supported in this implementation");
    }
    public void deleteEquipment(Long id) { 
        // This method is not used, so we'll throw an exception
        throw new RuntimeException("Equipment deletion not supported in this implementation");
    }

    public java.util.Optional<Resource> findResourceById(Long id) {
        java.util.Optional<Material> m = resourceRepository.findById(id);
        if (m.isPresent()) return m.map(x -> (Resource) x);
        // Equipment lookup is not supported in this implementation
        return java.util.Optional.empty();
    }


    public List<CompanyStock> getAllStockItems() {
        return companyStockRepository.findAll();
    }

    public Optional<CompanyStock> getStockItemById(Long id) {
        return companyStockRepository.findById(id);
    }

}


