package com.se2030.backend.repository;

import com.se2030.backend.model.ProjectAllocation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjectAllocationRepository extends JpaRepository<ProjectAllocation, Long> {
    List<ProjectAllocation> findByProject_ProjectId(Long projectId);

    @Query("select pa from ProjectAllocation pa join fetch pa.stockItem s where pa.project.projectId = :projectId")
    List<ProjectAllocation> findWithStockByProject(@Param("projectId") Long projectId);

    ProjectAllocation findByProject_ProjectIdAndStockItem_StockId(Long projectId, Long stockId);
}


