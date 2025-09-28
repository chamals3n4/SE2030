package com.se2030.backend.service;

import com.se2030.backend.model.PurchaseOrder;
import com.se2030.backend.model.PurchaseOrderItem;
import com.se2030.backend.model.Supplier;
import com.se2030.backend.model.Project;
import com.se2030.backend.repository.PurchaseOrderRepository;
import com.se2030.backend.repository.SupplierRepository;
import com.se2030.backend.repository.ProjectRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
public class PurchaseOrderService {

    @Autowired
    private PurchaseOrderRepository purchaseOrderRepository;


    @Autowired
    private SupplierRepository supplierRepository;

    @Autowired
    private ProjectRepository projectRepository;


    public List<PurchaseOrder> getAllPurchaseOrders() {
        return purchaseOrderRepository.findAll();
    }

    public Optional<PurchaseOrder> getPurchaseOrderById(Long id) {
        return purchaseOrderRepository.findById(id);
    }

}
