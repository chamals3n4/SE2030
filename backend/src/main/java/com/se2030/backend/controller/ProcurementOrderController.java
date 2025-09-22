package com.se2030.backend.controller;

import com.se2030.backend.model.ProcurementOrder;
import com.se2030.backend.service.ProcurementOrderService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/procurement-orders")
@CrossOrigin(origins = "*")
public class ProcurementOrderController {

    @Autowired
    private ProcurementOrderService procurementOrderService;

    @PostMapping
    public ResponseEntity<ProcurementOrder> create(@Valid @RequestBody ProcurementOrder order) {
        try {
            ProcurementOrder saved = procurementOrderService.create(order);
            return new ResponseEntity<>(saved, HttpStatus.CREATED);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }

    @PostMapping("/create-order")
    public ResponseEntity<ProcurementOrder> createOrder(
            @RequestParam Long resourceId,
            @RequestParam Long supplierId,
            @RequestParam @Min(1) Integer quantity,
            @RequestParam(required = false) BigDecimal unitPrice,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate expectedDeliveryDate,
            @RequestParam(required = false) String notes) {
        try {
            ProcurementOrder order = procurementOrderService.createOrder(resourceId, supplierId, quantity, unitPrice, expectedDeliveryDate, notes);
            return new ResponseEntity<>(order, HttpStatus.CREATED);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }

    @GetMapping
    public ResponseEntity<List<ProcurementOrder>> getAll() {
        return new ResponseEntity<>(procurementOrderService.getAll(), HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProcurementOrder> getById(@PathVariable("id") Long id) {
        Optional<ProcurementOrder> order = procurementOrderService.getById(id);
        return order.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProcurementOrder> update(@PathVariable("id") Long id, @Valid @RequestBody ProcurementOrder order) {
        try {
            ProcurementOrder updated = procurementOrderService.update(id, order);
            return new ResponseEntity<>(updated, HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable("id") Long id) {
        procurementOrderService.delete(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @GetMapping("/by-resource/{resourceId}")
    public ResponseEntity<List<ProcurementOrder>> getByResource(@PathVariable("resourceId") Long resourceId) {
        return new ResponseEntity<>(procurementOrderService.getByResource(resourceId), HttpStatus.OK);
    }

    @GetMapping("/by-supplier/{supplierId}")
    public ResponseEntity<List<ProcurementOrder>> getBySupplier(@PathVariable("supplierId") Long supplierId) {
        return new ResponseEntity<>(procurementOrderService.getBySupplier(supplierId), HttpStatus.OK);
    }

    @GetMapping("/by-status/{status}")
    public ResponseEntity<List<ProcurementOrder>> getByStatus(@PathVariable("status") String status) {
        return new ResponseEntity<>(procurementOrderService.getByStatus(status), HttpStatus.OK);
    }

    @GetMapping("/search")
    public ResponseEntity<List<ProcurementOrder>> search(@RequestParam("q") String q) {
        return new ResponseEntity<>(procurementOrderService.search(q), HttpStatus.OK);
    }

    @GetMapping("/by-order-date")
    public ResponseEntity<List<ProcurementOrder>> getByOrderDateBetween(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end) {
        return new ResponseEntity<>(procurementOrderService.getByOrderDateBetween(start, end), HttpStatus.OK);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ProcurementOrder> updateStatus(@PathVariable("id") Long id, @RequestParam String status) {
        try {
            ProcurementOrder updated = procurementOrderService.updateStatus(id, status);
            return new ResponseEntity<>(updated, HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
}
