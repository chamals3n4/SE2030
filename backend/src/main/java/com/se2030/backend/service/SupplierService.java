package com.se2030.backend.service;

import com.se2030.backend.model.Supplier;
import com.se2030.backend.repository.SupplierRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class SupplierService {

	@Autowired
	private SupplierRepository supplierRepository;

	public Supplier create(Supplier supplier) {
		if (supplier.getEmail() != null && supplierRepository.findByEmail(supplier.getEmail()).isPresent()) {
			throw new RuntimeException("Supplier with email " + supplier.getEmail() + " already exists");
		}
		return supplierRepository.save(supplier);
	}

	public List<Supplier> getAll() { return supplierRepository.findAll(); }
	public Optional<Supplier> getById(Long id) { return supplierRepository.findById(id); }

	public Supplier update(Long id, Supplier updated) {
		return supplierRepository.findById(id)
				.map(existing -> {
					existing.setCompanyName(updated.getCompanyName());
					existing.setContactName(updated.getContactName());
					existing.setEmail(updated.getEmail());
					existing.setPhone(updated.getPhone());
					existing.setAddress(updated.getAddress());
					return supplierRepository.save(existing);
				})
				.orElseThrow(() -> new RuntimeException("Supplier not found with id: " + id));
	}

	public void delete(Long id) { supplierRepository.deleteById(id); }

	public List<Supplier> search(String q) { return supplierRepository.search(q); }
	public List<Supplier> byName(String name) { return supplierRepository.findByCompanyNameContainingIgnoreCase(name); }
}


