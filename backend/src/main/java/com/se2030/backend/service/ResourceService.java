package com.se2030.backend.service;

import com.se2030.backend.model.Equipment;
import com.se2030.backend.model.Material;
import com.se2030.backend.model.Resource;
import com.se2030.backend.model.CompanyStock;
import com.se2030.backend.model.Supplier;
import com.se2030.backend.repository.MaterialRepository;
import com.se2030.backend.repository.SupplierRepository;
import com.se2030.backend.repository.EquipmentRepository;
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
    private MaterialRepository materialRepository;

    @Autowired
    private SupplierRepository supplierRepository;

    @Autowired
    private CompanyStockRepository companyStockRepository;

    @Autowired
    private EquipmentRepository equipmentRepository;

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
                    existing.setPrice(updated.getPrice());
                    return materialRepository.save(existing);
                })
                .orElseThrow(() -> new RuntimeException("Material not found with id: " + id));
    }
    public void deleteMaterial(Long id) { 
        Optional<Material> material = materialRepository.findById(id);
        if (material.isEmpty()) {
            throw new RuntimeException("Material not found with id: " + id);
        }
        
        materialRepository.deleteById(id); 
    }

    public Equipment createEquipment(Equipment equipment) { 
        return equipmentRepository.save(equipment);
    }
    public List<Equipment> getAllEquipment() { return equipmentRepository.findAll(); }
    public Optional<Equipment> getEquipmentById(Long id) { 
        return equipmentRepository.findById(id);
    }
    public Equipment updateEquipment(Long id, Equipment updated) {
        return equipmentRepository.findById(id)
                .map(existing -> {
                    existing.setName(updated.getName());
                    existing.setDescription(updated.getDescription());
                    existing.setStatus(updated.getStatus());
                    existing.setPreferredSupplier(updated.getPreferredSupplier());
                    existing.setModel(updated.getModel());
                    existing.setEquipmentType(updated.getEquipmentType());
                    existing.setWarrantyExpiry(updated.getWarrantyExpiry());
                    existing.setPrice(updated.getPrice());
                    return equipmentRepository.save(existing);
                })
                .orElseThrow(() -> new RuntimeException("Equipment not found with id: " + id));
    }
    public void deleteEquipment(Long id) { 
        equipmentRepository.deleteById(id);
    }

    public java.util.Optional<Resource> findResourceById(Long id) {
        java.util.Optional<Material> m = materialRepository.findById(id);
        if (m.isPresent()) return m.map(x -> (Resource) x);
        java.util.Optional<Equipment> e = equipmentRepository.findById(id);
        return e.map(x -> (Resource) x);
    }


    public List<CompanyStock> getAllStockItems() {
        return companyStockRepository.findAll();
    }

    public Optional<CompanyStock> getStockItemById(Long id) {
        return companyStockRepository.findById(id);
    }

}


