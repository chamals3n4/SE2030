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


	public Supplier create(Supplier supplier) { return supplierRepository.save(supplier); }
	public List<Supplier> getAll() { return supplierRepository.findAll(); }
	public Optional<Supplier> getById(Long id) { return supplierRepository.findById(id); }
	public void delete(Long id) { supplierRepository.deleteById(id); }
	public Supplier update(Long id, Supplier data) {
		return supplierRepository.findById(id).map(s -> {
			s.setCompanyName(data.getCompanyName());
			s.setContactName(data.getContactName());
			s.setEmail(data.getEmail());
			s.setPhone(data.getPhone());
			s.setAddress(data.getAddress());
			return supplierRepository.save(s);
		}).orElseThrow(() -> new RuntimeException("Supplier not found"));
	}
	public List<Supplier> searchByName(String name) { return supplierRepository.findByCompanyNameContainingIgnoreCase(name); }

}


