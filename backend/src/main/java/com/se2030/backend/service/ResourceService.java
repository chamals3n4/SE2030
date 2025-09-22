package com.se2030.backend.service;

import com.se2030.backend.model.Equipment;
import com.se2030.backend.model.Material;
import com.se2030.backend.model.Resource;
import com.se2030.backend.repository.EquipmentRepository;
import com.se2030.backend.repository.MaterialRepository;
import com.se2030.backend.repository.StockMovementRepository;
import com.se2030.backend.repository.ProcurementOrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class ResourceService {

    @Autowired
    private MaterialRepository materialRepository;

    @Autowired
    private EquipmentRepository equipmentRepository;

    @Autowired
    private StockMovementRepository stockMovementRepository;

    @Autowired
    private ProcurementOrderRepository procurementOrderRepository;

    public Material createMaterial(Material material) { return materialRepository.save(material); }
    public List<Material> getAllMaterials() { return materialRepository.findAll(); }
    public Optional<Material> getMaterialById(Long id) { return materialRepository.findById(id); }
    public Material updateMaterial(Long id, Material updated) {
        return materialRepository.findById(id)
                .map(existing -> {
                    existing.setName(updated.getName());
                    existing.setDescription(updated.getDescription());
                    existing.setStatus(updated.getStatus());
                    existing.setUnitOfMeasure(updated.getUnitOfMeasure());
                    existing.setCurrentStock(updated.getCurrentStock());
                    existing.setPreferredSupplier(updated.getPreferredSupplier());
                    existing.setReorderLevel(updated.getReorderLevel());
                    existing.setReorderQuantity(updated.getReorderQuantity());
                    return materialRepository.save(existing);
                })
                .orElseThrow(() -> new RuntimeException("Material not found with id: " + id));
    }
    public void deleteMaterial(Long id) { 
        // Check if material exists
        Optional<Material> material = materialRepository.findById(id);
        if (material.isEmpty()) {
            throw new RuntimeException("Material not found with id: " + id);
        }
        
        // Check for existing stock movements
        List<com.se2030.backend.model.StockMovement> stockMovements = stockMovementRepository.findByResource_ResourceId(id);
        if (!stockMovements.isEmpty()) {
            throw new RuntimeException("Cannot delete material: " + stockMovements.size() + " stock movement records exist. Please archive the material instead or contact administrator to remove stock history.");
        }
        
        // Check for existing procurement orders
        List<com.se2030.backend.model.ProcurementOrder> orders = procurementOrderRepository.findByResource_ResourceId(id);
        if (!orders.isEmpty()) {
            throw new RuntimeException("Cannot delete material: " + orders.size() + " procurement order records exist. Please complete or cancel all orders first.");
        }
        
        materialRepository.deleteById(id); 
    }
    public List<Material> materialsByUnit(String uom) { return materialRepository.findByUnitOfMeasure(uom); }

    public Equipment createEquipment(Equipment equipment) { return equipmentRepository.save(equipment); }
    public List<Equipment> getAllEquipment() { return equipmentRepository.findAll(); }
    public Optional<Equipment> getEquipmentById(Long id) { return equipmentRepository.findById(id); }
    public Equipment updateEquipment(Long id, Equipment updated) {
        return equipmentRepository.findById(id)
                .map(existing -> {
                    existing.setName(updated.getName());
                    existing.setDescription(updated.getDescription());
                    existing.setStatus(updated.getStatus());
                    existing.setModel(updated.getModel());
                    existing.setEquipmentType(updated.getEquipmentType());
                    existing.setWarrantyExpiry(updated.getWarrantyExpiry());
                    existing.setPreferredSupplier(updated.getPreferredSupplier());
                    existing.setReorderLevel(updated.getReorderLevel());
                    existing.setReorderQuantity(updated.getReorderQuantity());
                    return equipmentRepository.save(existing);
                })
                .orElseThrow(() -> new RuntimeException("Equipment not found with id: " + id));
    }
    public void deleteEquipment(Long id) { 
        // Check if equipment exists
        Optional<Equipment> equipment = equipmentRepository.findById(id);
        if (equipment.isEmpty()) {
            throw new RuntimeException("Equipment not found with id: " + id);
        }
        
        // Check for existing stock movements
        List<com.se2030.backend.model.StockMovement> stockMovements = stockMovementRepository.findByResource_ResourceId(id);
        if (!stockMovements.isEmpty()) {
            throw new RuntimeException("Cannot delete equipment: " + stockMovements.size() + " stock movement records exist. Please archive the equipment instead or contact administrator to remove stock history.");
        }
        
        // Check for existing procurement orders
        List<com.se2030.backend.model.ProcurementOrder> orders = procurementOrderRepository.findByResource_ResourceId(id);
        if (!orders.isEmpty()) {
            throw new RuntimeException("Cannot delete equipment: " + orders.size() + " procurement order records exist. Please complete or cancel all orders first.");
        }
        
        equipmentRepository.deleteById(id); 
    }
    public List<Equipment> equipmentByType(String type) { return equipmentRepository.findByEquipmentType(type); }

    public java.util.Optional<Resource> findResourceById(Long id) {
        java.util.Optional<Material> m = materialRepository.findById(id);
        if (m.isPresent()) return m.map(x -> (Resource) x);
        java.util.Optional<Equipment> e = equipmentRepository.findById(id);
        return e.map(x -> (Resource) x);
    }

    public List<Material> getMaterialsBySupplier(Long supplierId) {
        return materialRepository.findByPreferredSupplier_SupplierId(supplierId);
    }

    public List<Equipment> getEquipmentBySupplier(Long supplierId) {
        return equipmentRepository.findByPreferredSupplier_SupplierId(supplierId);
    }

    public List<Material> getLowStockMaterials() {
        return materialRepository.findLowStockMaterials();
    }

    // Archive methods (safe alternative to deletion)
    public Material archiveMaterial(Long id) {
        return materialRepository.findById(id)
                .map(material -> {
                    material.setStatus("INACTIVE");
                    return materialRepository.save(material);
                })
                .orElseThrow(() -> new RuntimeException("Material not found with id: " + id));
    }

    public Equipment archiveEquipment(Long id) {
        return equipmentRepository.findById(id)
                .map(equipment -> {
                    equipment.setStatus("INACTIVE");
                    return equipmentRepository.save(equipment);
                })
                .orElseThrow(() -> new RuntimeException("Equipment not found with id: " + id));
    }

    // Force delete methods (admin only - removes all related data)
    @Transactional
    public void forceDeleteMaterial(Long id) {
        // Delete related records first
        stockMovementRepository.deleteAll(stockMovementRepository.findByResource_ResourceId(id));
        procurementOrderRepository.deleteAll(procurementOrderRepository.findByResource_ResourceId(id));
        // Then delete the material
        materialRepository.deleteById(id);
    }

    @Transactional
    public void forceDeleteEquipment(Long id) {
        // Delete related records first
        stockMovementRepository.deleteAll(stockMovementRepository.findByResource_ResourceId(id));
        procurementOrderRepository.deleteAll(procurementOrderRepository.findByResource_ResourceId(id));
        // Then delete the equipment
        equipmentRepository.deleteById(id);
    }
}


