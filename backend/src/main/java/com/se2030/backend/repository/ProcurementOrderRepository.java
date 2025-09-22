package com.se2030.backend.repository;

import com.se2030.backend.model.ProcurementOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ProcurementOrderRepository extends JpaRepository<ProcurementOrder, Long> {
    List<ProcurementOrder> findByResource_ResourceId(Long resourceId);
    List<ProcurementOrder> findBySupplier_SupplierId(Long supplierId);
    List<ProcurementOrder> findByStatus(String status);
    List<ProcurementOrder> findByOrderDateBetween(LocalDate start, LocalDate end);
    List<ProcurementOrder> findByExpectedDeliveryDateBetween(LocalDate start, LocalDate end);
    List<ProcurementOrder> findByActualDeliveryDateBetween(LocalDate start, LocalDate end);

    @Query("SELECT po FROM ProcurementOrder po WHERE LOWER(po.notes) LIKE LOWER(CONCAT('%', :q, '%')) OR LOWER(po.resource.name) LIKE LOWER(CONCAT('%', :q, '%')) OR LOWER(po.supplier.companyName) LIKE LOWER(CONCAT('%', :q, '%'))")
    List<ProcurementOrder> search(@Param("q") String q);

    @Query("SELECT po FROM ProcurementOrder po WHERE po.resource.resourceId = :resourceId AND po.supplier.supplierId = :supplierId")
    List<ProcurementOrder> findByResourceAndSupplier(@Param("resourceId") Long resourceId, @Param("supplierId") Long supplierId);
}
