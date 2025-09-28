package com.se2030.backend.repository;

import com.se2030.backend.model.Material;
import com.se2030.backend.model.Equipment;
import com.se2030.backend.model.StockMovement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ResourceRepository extends JpaRepository<Material, Long> {
    
    @Query("SELECT e FROM Equipment e")
    List<Equipment> findAllEquipment();
    
    @Query("SELECT sm FROM StockMovement sm WHERE sm.resource.resourceId = :resourceId")
    List<StockMovement> findStockMovementsByResource(@Param("resourceId") Long resourceId);
}
