package com.se2030.backend.controller;

import com.se2030.backend.model.Resource;
import com.se2030.backend.model.StockMovement;
import com.se2030.backend.service.InventoryService;
import com.se2030.backend.service.ResourceService;
import jakarta.validation.constraints.Min;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/inventory")
@CrossOrigin(origins = "*")
public class InventoryController {

    @Autowired
    private InventoryService inventoryService;

    @Autowired
    private ResourceService resourceService;

    @PostMapping("/receive/{resourceId}")
    public ResponseEntity<StockMovement> receive(
            @PathVariable Long resourceId,
            @RequestParam @Min(1) int quantity,
            @RequestParam(required = false) String refType,
            @RequestParam(required = false) Long refId,
            @RequestParam(required = false) String notes) {
        Optional<Resource> res = resourceService.findResourceById(resourceId);
        if (res.isEmpty()) return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        StockMovement sm = inventoryService.receive(res.get(), quantity, refType, refId, notes);
        return new ResponseEntity<>(sm, HttpStatus.CREATED);
    }

    @PostMapping("/consume/{resourceId}")
    public ResponseEntity<StockMovement> consume(
            @PathVariable Long resourceId,
            @RequestParam @Min(1) int quantity,
            @RequestParam(required = false) String refType,
            @RequestParam(required = false) Long refId,
            @RequestParam(required = false) String notes) {
        Optional<Resource> res = resourceService.findResourceById(resourceId);
        if (res.isEmpty()) return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        StockMovement sm = inventoryService.consume(res.get(), quantity, refType, refId, notes);
        return new ResponseEntity<>(sm, HttpStatus.CREATED);
    }

    @PostMapping("/adjust/{resourceId}")
    public ResponseEntity<StockMovement> adjust(
            @PathVariable Long resourceId,
            @RequestParam int quantity,
            @RequestParam(required = false) String notes) {
        Optional<Resource> res = resourceService.findResourceById(resourceId);
        if (res.isEmpty()) return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        StockMovement sm = inventoryService.adjust(res.get(), quantity, notes);
        return new ResponseEntity<>(sm, HttpStatus.CREATED);
    }
}


