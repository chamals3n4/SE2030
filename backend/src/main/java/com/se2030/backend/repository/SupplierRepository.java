package com.se2030.backend.repository;

import com.se2030.backend.model.Supplier;
import com.se2030.backend.model.SupplierStore;
import com.se2030.backend.model.ProcurementOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface SupplierRepository extends JpaRepository<Supplier, Long> {
    
    @Query("SELECT ss FROM SupplierStore ss")
    List<SupplierStore> findAllSupplierStores();
    
    @Query("SELECT po FROM ProcurementOrder po WHERE po.resource.resourceId = :resourceId")
    List<ProcurementOrder> findProcurementOrdersByResource(@Param("resourceId") Long resourceId);
}


