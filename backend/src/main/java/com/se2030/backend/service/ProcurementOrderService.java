package com.se2030.backend.service;

import com.se2030.backend.model.ProcurementOrder;
import com.se2030.backend.model.Resource;
import com.se2030.backend.model.Supplier;
import com.se2030.backend.repository.ProcurementOrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class ProcurementOrderService {

    @Autowired
    private ProcurementOrderRepository procurementOrderRepository;

    @Autowired
    private ResourceService resourceService;

    @Autowired
    private SupplierService supplierService;

    public ProcurementOrder create(ProcurementOrder order) {
        // Calculate total amount if unit price is provided
        if (order.getUnitPrice() != null && order.getQuantity() != null) {
            BigDecimal total = order.getUnitPrice().multiply(BigDecimal.valueOf(order.getQuantity()));
            order.setTotalAmount(total);
        }
        return procurementOrderRepository.save(order);
    }

    public ProcurementOrder createOrder(Long resourceId, Long supplierId, Integer quantity, BigDecimal unitPrice, LocalDate expectedDeliveryDate, String notes) {
        Optional<Resource> resourceOpt = resourceService.findResourceById(resourceId);
        Optional<Supplier> supplierOpt = supplierService.getById(supplierId);

        if (resourceOpt.isEmpty()) {
            throw new RuntimeException("Resource not found with id: " + resourceId);
        }
        if (supplierOpt.isEmpty()) {
            throw new RuntimeException("Supplier not found with id: " + supplierId);
        }

        ProcurementOrder order = new ProcurementOrder();
        order.setResource(resourceOpt.get());
        order.setSupplier(supplierOpt.get());
        order.setQuantity(quantity);
        order.setUnitPrice(unitPrice);
        order.setExpectedDeliveryDate(expectedDeliveryDate);
        order.setNotes(notes);

        if (unitPrice != null) {
            order.setTotalAmount(unitPrice.multiply(BigDecimal.valueOf(quantity)));
        }

        return procurementOrderRepository.save(order);
    }

    public List<ProcurementOrder> getAll() {
        return procurementOrderRepository.findAll();
    }

    public Optional<ProcurementOrder> getById(Long id) {
        return procurementOrderRepository.findById(id);
    }

    public ProcurementOrder update(Long id, ProcurementOrder updated) {
        return procurementOrderRepository.findById(id)
                .map(existing -> {
                    existing.setQuantity(updated.getQuantity());
                    existing.setUnitPrice(updated.getUnitPrice());
                    existing.setStatus(updated.getStatus());
                    existing.setExpectedDeliveryDate(updated.getExpectedDeliveryDate());
                    existing.setActualDeliveryDate(updated.getActualDeliveryDate());
                    existing.setNotes(updated.getNotes());

                    // Recalculate total amount
                    if (existing.getUnitPrice() != null && existing.getQuantity() != null) {
                        BigDecimal total = existing.getUnitPrice().multiply(BigDecimal.valueOf(existing.getQuantity()));
                        existing.setTotalAmount(total);
                    }

                    return procurementOrderRepository.save(existing);
                })
                .orElseThrow(() -> new RuntimeException("Procurement order not found with id: " + id));
    }

    public void delete(Long id) {
        procurementOrderRepository.deleteById(id);
    }

    public List<ProcurementOrder> getByResource(Long resourceId) {
        return procurementOrderRepository.findByResource_ResourceId(resourceId);
    }

    public List<ProcurementOrder> getBySupplier(Long supplierId) {
        return procurementOrderRepository.findBySupplier_SupplierId(supplierId);
    }

    public List<ProcurementOrder> getByStatus(String status) {
        return procurementOrderRepository.findByStatus(status);
    }

    public List<ProcurementOrder> getByOrderDateBetween(LocalDate start, LocalDate end) {
        return procurementOrderRepository.findByOrderDateBetween(start, end);
    }

    public List<ProcurementOrder> search(String q) {
        return procurementOrderRepository.search(q);
    }

    public ProcurementOrder updateStatus(Long id, String status) {
        return procurementOrderRepository.findById(id)
                .map(order -> {
                    order.setStatus(status);
                    if ("DELIVERED".equals(status) && order.getActualDeliveryDate() == null) {
                        order.setActualDeliveryDate(LocalDate.now());
                    }
                    return procurementOrderRepository.save(order);
                })
                .orElseThrow(() -> new RuntimeException("Procurement order not found with id: " + id));
    }
}
