package com.se2030.backend.controller;

import com.se2030.backend.model.PurchaseOrder;
import com.se2030.backend.model.PurchaseOrderItem;
import com.se2030.backend.model.Resource;
import com.se2030.backend.service.ResourceService;
import com.se2030.backend.dto.PurchaseOrderItemDTO;
import com.se2030.backend.service.PurchaseOrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/purchase-orders")
@CrossOrigin(origins = "http://localhost:5173")
public class PurchaseOrderController {

    @Autowired
    private PurchaseOrderService purchaseOrderService;

    @Autowired
    private ResourceService resourceService;

    @GetMapping
    public ResponseEntity<List<PurchaseOrder>> getAllPurchaseOrders() {
        List<PurchaseOrder> orders = purchaseOrderService.getAllPurchaseOrders();
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PurchaseOrder> getPurchaseOrderById(@PathVariable Long id) {
        Optional<PurchaseOrder> order = purchaseOrderService.getPurchaseOrderById(id);
        return order.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

}
