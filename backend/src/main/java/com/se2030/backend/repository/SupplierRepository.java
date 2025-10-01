package com.se2030.backend.repository;

import com.se2030.backend.model.Supplier;
// Removed SupplierStore and ProcurementOrder per simplified flow
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface SupplierRepository extends JpaRepository<Supplier, Long> {
    
    List<Supplier> findByCompanyNameContainingIgnoreCase(String companyName);
}


