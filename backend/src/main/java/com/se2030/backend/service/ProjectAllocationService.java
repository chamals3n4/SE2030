package com.se2030.backend.service;

import com.se2030.backend.model.CompanyStock;
import com.se2030.backend.model.Project;
import com.se2030.backend.model.ProjectAllocation;
import com.se2030.backend.repository.CompanyStockRepository;
import com.se2030.backend.repository.ProjectAllocationRepository;
import com.se2030.backend.repository.ProjectRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class ProjectAllocationService {

    @Autowired private ProjectAllocationRepository allocationRepository;
    @Autowired private ProjectRepository projectRepository;
    @Autowired private CompanyStockRepository companyStockRepository;

    public List<ProjectAllocation> getByProject(Long projectId) {
        return allocationRepository.findWithStockByProject(projectId);
    }

    public ProjectAllocation addToProject(Long projectId, Long stockId, Integer quantity) {
        Project project = projectRepository.findById(projectId).orElseThrow();
        CompanyStock stock = companyStockRepository.findById(stockId).orElseThrow();
        if (quantity == null || quantity <= 0) throw new IllegalArgumentException("Quantity must be positive");
        if (stock.getCurrentQuantity() == null || stock.getCurrentQuantity() < quantity) {
            throw new IllegalArgumentException("Insufficient stock quantity");
        }

        stock.setCurrentQuantity(stock.getCurrentQuantity() - quantity);
        companyStockRepository.save(stock);

        // Merge allocation by project + stock item
        ProjectAllocation allocation = allocationRepository
                .findByProject_ProjectIdAndStockItem_StockId(projectId, stockId);
        if (allocation == null) {
            allocation = new ProjectAllocation();
            allocation.setProject(project);
            allocation.setStockItem(stock);
            allocation.setQuantity(quantity);
        } else {
            allocation.setQuantity(allocation.getQuantity() + quantity);
        }
        return allocationRepository.save(allocation);
    }

    public void removeAllocation(Long allocationId) {
        allocationRepository.findById(allocationId).ifPresent(allocation -> {
            CompanyStock stock = allocation.getStockItem();
            if (stock != null && allocation.getQuantity() != null) {
                int back = (stock.getCurrentQuantity() == null ? 0 : stock.getCurrentQuantity()) + allocation.getQuantity();
                stock.setCurrentQuantity(back);
                companyStockRepository.save(stock);
            }
            allocationRepository.delete(allocation);
        });
    }
}


