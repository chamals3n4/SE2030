package com.se2030.backend.service;

import com.se2030.backend.model.Supplier;
import com.se2030.backend.model.SupplierStore;
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


	public List<SupplierStore> getAllStores() {
		return supplierRepository.findAllSupplierStores();
	}

	public Optional<SupplierStore> getStoreById(Long id) {
		// This method is not used, so we'll return empty
		return Optional.empty();
	}

}


