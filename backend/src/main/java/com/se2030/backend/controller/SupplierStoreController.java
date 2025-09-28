package com.se2030.backend.controller;

import com.se2030.backend.model.SupplierStore;
import com.se2030.backend.service.SupplierService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/supplier-stores")
@CrossOrigin(origins = "http://localhost:5173")
public class SupplierStoreController {

    @Autowired
    private SupplierService supplierService;

    @GetMapping
    public ResponseEntity<List<SupplierStore>> getAllStores() {
        List<SupplierStore> stores = supplierService.getAllStores();
        return ResponseEntity.ok(stores);
    }

    @GetMapping("/{id}")
    public ResponseEntity<SupplierStore> getStoreById(@PathVariable Long id) {
        Optional<SupplierStore> store = supplierService.getStoreById(id);
        return store.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

}
