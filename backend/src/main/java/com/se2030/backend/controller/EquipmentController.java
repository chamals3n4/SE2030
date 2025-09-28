package com.se2030.backend.controller;

import com.se2030.backend.model.Equipment;
import com.se2030.backend.service.ResourceService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/equipment")
@CrossOrigin(origins = "*")
public class EquipmentController {

    @Autowired
    private ResourceService resourceService;

    @PostMapping
    public ResponseEntity<Equipment> create(@Valid @RequestBody Equipment equipment) {
        Equipment saved = resourceService.createEquipment(equipment);
        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<Equipment>> getAll() {
        return new ResponseEntity<>(resourceService.getAllEquipment(), HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Equipment> getById(@PathVariable("id") Long id) {
        Optional<Equipment> equipment = resourceService.getEquipmentById(id);
        return equipment.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Equipment> update(@PathVariable("id") Long id, @Valid @RequestBody Equipment equipment) {
        try {
            Equipment updated = resourceService.updateEquipment(id, equipment);
            return new ResponseEntity<>(updated, HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable("id") Long id) {
        resourceService.deleteEquipment(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

}


