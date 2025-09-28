package com.se2030.backend.controller;

import com.se2030.backend.model.CompanyStock;
import com.se2030.backend.service.ResourceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/company-stock")
@CrossOrigin(origins = "http://localhost:5173")
public class CompanyStockController {

    @Autowired
    private ResourceService resourceService;

    @GetMapping
    public ResponseEntity<List<CompanyStock>> getAllStockItems() {
        List<CompanyStock> stockItems = resourceService.getAllStockItems();
        return ResponseEntity.ok(stockItems);
    }

    @GetMapping("/{id}")
    public ResponseEntity<CompanyStock> getStockItemById(@PathVariable Long id) {
        Optional<CompanyStock> stockItem = resourceService.getStockItemById(id);
        return stockItem.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

}
