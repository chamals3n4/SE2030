package com.se2030.backend.service;

import com.se2030.backend.dto.FinanceSummaryDTO;
import com.se2030.backend.model.FinanceEntry;
import com.se2030.backend.model.Project;
import com.se2030.backend.repository.FinanceEntryRepository;
import com.se2030.backend.repository.ProjectRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class FinanceService {

    @Autowired
    private FinanceEntryRepository financeEntryRepository;
    @Autowired
    private ProjectRepository projectRepository;

    public FinanceEntry create(FinanceEntry entry) {
        return financeEntryRepository.save(entry);
    }

    public List<FinanceEntry> getByProject(Long projectId) {
        return financeEntryRepository.findByProject_ProjectId(projectId);
    }


    public Optional<FinanceSummaryDTO> getSummary(Long projectId) {
        Optional<Project> projectOpt = projectRepository.findById(projectId);
        if (projectOpt.isEmpty()) return Optional.empty();
        Project project = projectOpt.get();

        BigDecimal budget = project.getBudget() == null ? BigDecimal.ZERO : project.getBudget();
        BigDecimal capital = financeEntryRepository.sumCapital(projectId);
        BigDecimal expense = financeEntryRepository.sumExpense(projectId);
        BigDecimal balance = capital.subtract(expense);

        FinanceSummaryDTO dto = new FinanceSummaryDTO();
        dto.setProjectId(projectId);
        dto.setBudget(budget);
        dto.setTotalCapital(capital);
        dto.setTotalExpense(expense);
        dto.setBalance(balance);
        return Optional.of(dto);
    }

    public Optional<FinanceEntry> getById(Long id) {
        return financeEntryRepository.findById(id);
    }

    public FinanceEntry update(Long id, FinanceEntry updated) {
        return financeEntryRepository.findById(id)
                .map(existing -> {
                    existing.setType(updated.getType());
                    existing.setAmount(updated.getAmount());
                    existing.setDescription(updated.getDescription());
                    existing.setReference(updated.getReference());
                    existing.setEntryDate(updated.getEntryDate());
                    return financeEntryRepository.save(existing);
                })
                .orElseThrow(() -> new RuntimeException("Finance entry not found with id: " + id));
    }

    public void delete(Long id) {
        financeEntryRepository.deleteById(id);
    }

}


