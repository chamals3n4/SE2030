package com.se2030.backend.repository;

import com.se2030.backend.model.Supplier;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SupplierRepository extends JpaRepository<Supplier, Long> {
    Optional<Supplier> findByEmail(String email);
    List<Supplier> findByCompanyNameContainingIgnoreCase(String name);
    Optional<Supplier> findByPhone(String phone);

    @Query("SELECT s FROM Supplier s WHERE " +
            "LOWER(s.companyName) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
            "LOWER(s.contactName) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
            "LOWER(s.email) LIKE LOWER(CONCAT('%', :q, '%'))")
    List<Supplier> search(@Param("q") String q);
}


