package com.se2030.backend.controller;

import com.se2030.backend.model.Material;
import com.se2030.backend.service.ResourceService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/materials")
@CrossOrigin(origins = "*")
public class MaterialController {

	@Autowired
	private ResourceService resourceService;

	@PostMapping
	public ResponseEntity<Material> create(@Valid @RequestBody Material material) {
		Material saved = resourceService.createMaterial(material);
		return new ResponseEntity<>(saved, HttpStatus.CREATED);
	}

	@GetMapping
	public ResponseEntity<List<Material>> getAll() {
		return new ResponseEntity<>(resourceService.getAllMaterials(), HttpStatus.OK);
	}

	@GetMapping("/{id}")
	public ResponseEntity<Material> getById(@PathVariable("id") Long id) {
		Optional<Material> material = resourceService.getMaterialById(id);
		return material.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
				.orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
	}

	@PutMapping("/{id}")
	public ResponseEntity<Material> update(@PathVariable("id") Long id, @Valid @RequestBody Material material) {
		try {
			Material updated = resourceService.updateMaterial(id, material);
			return new ResponseEntity<>(updated, HttpStatus.OK);
		} catch (RuntimeException e) {
			return new ResponseEntity<>(HttpStatus.NOT_FOUND);
		}
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<Void> delete(@PathVariable("id") Long id) {
		resourceService.deleteMaterial(id);
		return new ResponseEntity<>(HttpStatus.NO_CONTENT);
	}

	@GetMapping("/by-unit/{uom}")
	public ResponseEntity<List<Material>> byUnit(@PathVariable("uom") String uom) {
		return new ResponseEntity<>(resourceService.materialsByUnit(uom), HttpStatus.OK);
	}

	@GetMapping("/by-supplier/{supplierId}")
	public ResponseEntity<List<Material>> bySupplier(@PathVariable("supplierId") Long supplierId) {
		return new ResponseEntity<>(resourceService.getMaterialsBySupplier(supplierId), HttpStatus.OK);
	}

	@GetMapping("/low-stock")
	public ResponseEntity<List<Material>> getLowStock() {
		return new ResponseEntity<>(resourceService.getLowStockMaterials(), HttpStatus.OK);
	}

	@PutMapping("/{id}/archive")
	public ResponseEntity<Material> archive(@PathVariable("id") Long id) {
		try {
			Material archived = resourceService.archiveMaterial(id);
			return new ResponseEntity<>(archived, HttpStatus.OK);
		} catch (RuntimeException e) {
			return new ResponseEntity<>(HttpStatus.NOT_FOUND);
		}
	}

	@DeleteMapping("/{id}/force")
	public ResponseEntity<Void> forceDelete(@PathVariable("id") Long id) {
		try {
			resourceService.forceDeleteMaterial(id);
			return new ResponseEntity<>(HttpStatus.NO_CONTENT);
		} catch (RuntimeException e) {
			return new ResponseEntity<>(HttpStatus.NOT_FOUND);
		}
	}
}


