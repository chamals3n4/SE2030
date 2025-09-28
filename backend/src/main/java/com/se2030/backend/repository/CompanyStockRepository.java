package com.se2030.backend.repository;

import com.se2030.backend.model.CompanyStock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CompanyStockRepository extends JpaRepository<CompanyStock, Long> {
    
}
