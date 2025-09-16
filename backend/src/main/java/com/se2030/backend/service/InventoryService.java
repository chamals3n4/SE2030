package com.se2030.backend.service;

import com.se2030.backend.model.Material;
import com.se2030.backend.model.Resource;
import com.se2030.backend.model.StockMovement;
import com.se2030.backend.repository.MaterialRepository;
import com.se2030.backend.repository.StockMovementRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class InventoryService {

    @Autowired
    private MaterialRepository materialRepository;

    @Autowired
    private StockMovementRepository stockMovementRepository;

    public StockMovement receive(Resource resource, int quantity, String refType, Long refId, String notes) {
        adjustMaterialStock(resource, quantity);
        return recordMovement(resource, "RECEIVE", quantity, refType, refId, notes);
    }

    public StockMovement consume(Resource resource, int quantity, String refType, Long refId, String notes) {
        adjustMaterialStock(resource, -quantity);
        return recordMovement(resource, "CONSUME", quantity, refType, refId, notes);
    }

    public StockMovement adjust(Resource resource, int quantity, String notes) {
        adjustMaterialStock(resource, quantity);
        return recordMovement(resource, "ADJUST", Math.abs(quantity), null, null, notes);
    }

    private void adjustMaterialStock(Resource resource, int delta) {
        if (resource instanceof Material) {
            Material m = (Material) resource;
            Integer current = m.getCurrentStock() == null ? 0 : m.getCurrentStock();
            int next = current + delta;
            if (next < 0) next = 0;
            m.setCurrentStock(next);
            materialRepository.save(m);
        }
    }

    private StockMovement recordMovement(Resource resource, String type, int quantity, String refType, Long refId, String notes) {
        StockMovement sm = new StockMovement();
        sm.setResource(resource);
        sm.setType(type);
        sm.setQuantity(quantity);
        sm.setRefType(refType);
        sm.setRefId(refId);
        sm.setNotes(notes);
        return stockMovementRepository.save(sm);
    }
}


