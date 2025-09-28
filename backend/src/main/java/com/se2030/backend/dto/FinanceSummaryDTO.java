package com.se2030.backend.dto;

import java.math.BigDecimal;

public class FinanceSummaryDTO {
    private Long projectId;
    private BigDecimal budget;
    private BigDecimal totalCapital; // receipts
    private BigDecimal totalExpense;
    private BigDecimal balance;

    public Long getProjectId() { return projectId; }
    public void setProjectId(Long projectId) { this.projectId = projectId; }
    public BigDecimal getBudget() { return budget; }
    public void setBudget(BigDecimal budget) { this.budget = budget; }
    public BigDecimal getTotalCapital() { return totalCapital; }
    public void setTotalCapital(BigDecimal totalCapital) { this.totalCapital = totalCapital; }
    public BigDecimal getTotalExpense() { return totalExpense; }
    public void setTotalExpense(BigDecimal totalExpense) { this.totalExpense = totalExpense; }
    public BigDecimal getBalance() { return balance; }
    public void setBalance(BigDecimal balance) { this.balance = balance; }
}


