package com.se2030.backend.repository;

import com.se2030.backend.model.StockMovement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StockMovementRepository extends JpaRepository<StockMovement, Long> {
    List<StockMovement> findByResource_ResourceId(Long resourceId);
    List<StockMovement> findByRefTypeAndRefId(String refType, Long refId);
}


