package com.se2030.backend.repository;

import com.se2030.backend.model.FinanceEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface FinanceEntryRepository extends JpaRepository<FinanceEntry, Long> {
    List<FinanceEntry> findByProject_ProjectId(Long projectId);

    @Query("SELECT COALESCE(SUM(CASE WHEN f.type='CAPITAL_RECEIPT' THEN f.amount ELSE 0 END), 0) FROM FinanceEntry f WHERE f.project.projectId = :projectId")
    java.math.BigDecimal sumCapital(@Param("projectId") Long projectId);

    @Query("SELECT COALESCE(SUM(CASE WHEN f.type='EXPENSE' THEN f.amount ELSE 0 END), 0) FROM FinanceEntry f WHERE f.project.projectId = :projectId")
    java.math.BigDecimal sumExpense(@Param("projectId") Long projectId);
}


