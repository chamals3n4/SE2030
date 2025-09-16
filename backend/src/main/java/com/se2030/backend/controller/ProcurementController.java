package com.se2030.backend.controller;

import com.se2030.backend.model.Supplier;
import com.se2030.backend.service.SupplierService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class ProcurementController {

    @Autowired private SupplierService supplierService;

    @PostMapping("/suppliers")
    public ResponseEntity<Supplier> createSupplier(@Valid @RequestBody Supplier supplier) {
        try { return new ResponseEntity<>(supplierService.create(supplier), HttpStatus.CREATED); }
        catch (RuntimeException e) { return new ResponseEntity<>(HttpStatus.BAD_REQUEST); }
    }

    @GetMapping("/suppliers")
    public ResponseEntity<List<Supplier>> getSuppliers() { return new ResponseEntity<>(supplierService.getAll(), HttpStatus.OK); }

    @GetMapping("/suppliers/{id}")
    public ResponseEntity<Supplier> getSupplier(@PathVariable("id") Long id) {
        Optional<Supplier> s = supplierService.getById(id);
        return s.map(value -> new ResponseEntity<>(value, HttpStatus.OK)).orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @PutMapping("/suppliers/{id}")
    public ResponseEntity<Supplier> updateSupplier(@PathVariable("id") Long id, @Valid @RequestBody Supplier supplier) {
        try { return new ResponseEntity<>(supplierService.update(id, supplier), HttpStatus.OK); }
        catch (RuntimeException e) { return new ResponseEntity<>(HttpStatus.NOT_FOUND); }
    }

    @DeleteMapping("/suppliers/{id}")
    public ResponseEntity<Void> deleteSupplier(@PathVariable("id") Long id) { supplierService.delete(id); return new ResponseEntity<>(HttpStatus.NO_CONTENT); }

    @GetMapping("/suppliers/search")
    public ResponseEntity<List<Supplier>> searchSuppliers(@RequestParam("q") String q) { return new ResponseEntity<>(supplierService.search(q), HttpStatus.OK); }

    @GetMapping("/suppliers/by-name")
    public ResponseEntity<List<Supplier>> suppliersByName(@RequestParam("name") String name) { return new ResponseEntity<>(supplierService.byName(name), HttpStatus.OK); }
}


