package com.se2030.backend.controller;

import com.se2030.backend.model.CompanyStock;
import com.se2030.backend.service.InventoryService;
import com.se2030.backend.repository.CompanyStockRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/company-stock")
@CrossOrigin(origins = "*")
public class CompanyStockController {

    @Autowired private CompanyStockRepository companyStockRepository;
    @Autowired private InventoryService inventoryService;

    @GetMapping
    public ResponseEntity<List<CompanyStock>> list() {
        return new ResponseEntity<>(companyStockRepository.findAll(), HttpStatus.OK);
    }

    @PostMapping("/from-purchase")
    public ResponseEntity<CompanyStock> addFromPurchase(@RequestParam(required = false) Long supplierId,
                                                        @RequestParam Long resourceId,
                                                        @RequestParam String resourceType,
                                                        @RequestParam Integer quantity,
                                                        @RequestParam(required = false) BigDecimal unitCost,
                                                        @RequestParam(required = false) String name,
                                                        @RequestParam(required = false) String description) {
        CompanyStock saved = inventoryService.addFromPurchase(supplierId, resourceId, resourceType, quantity, unitCost, name, description);
        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }


    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable("id") Long stockId) {
        companyStockRepository.deleteById(stockId);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
