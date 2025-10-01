package com.se2030.backend.controller;

import com.se2030.backend.model.ProjectAllocation;
import com.se2030.backend.model.CompanyStock;
import com.se2030.backend.dto.ProjectAllocationDTO;
import com.se2030.backend.service.ProjectAllocationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/projects/{projectId}/allocations")
@CrossOrigin(origins = "*")
public class ProjectAllocationController {

    @Autowired private ProjectAllocationService allocationService;

    @GetMapping
    public ResponseEntity<List<ProjectAllocationDTO>> list(@PathVariable Long projectId) {
        List<ProjectAllocation> list = allocationService.getByProject(projectId);
        List<ProjectAllocationDTO> dto = list.stream().map(pa -> {
            ProjectAllocationDTO d = new ProjectAllocationDTO();
            d.setAllocationId(pa.getAllocationId());
            CompanyStock s = pa.getStockItem();
            if (s != null) {
                d.setStockId(s.getStockId());
                d.setName(s.getName());
                d.setResourceType(s.getResourceType());
                d.setUnitOfMeasure(s.getUnitOfMeasure());
            }
            d.setQuantity(pa.getQuantity());
            return d;
        }).toList();
        return new ResponseEntity<>(dto, HttpStatus.OK);
    }

    @PostMapping
    public ResponseEntity<ProjectAllocationDTO> add(@PathVariable Long projectId,
                                                 @RequestParam Long stockId,
                                                 @RequestParam Integer quantity) {
        ProjectAllocation saved = allocationService.addToProject(projectId, stockId, quantity);
        ProjectAllocationDTO d = new ProjectAllocationDTO();
        d.setAllocationId(saved.getAllocationId());
        CompanyStock s = saved.getStockItem();
        if (s != null) {
            d.setStockId(s.getStockId());
            d.setName(s.getName());
            d.setResourceType(s.getResourceType());
            d.setUnitOfMeasure(s.getUnitOfMeasure());
        }
        d.setQuantity(saved.getQuantity());
        return new ResponseEntity<>(d, HttpStatus.CREATED);
    }

    @DeleteMapping("/{allocationId}")
    public ResponseEntity<Void> delete(@PathVariable Long projectId, @PathVariable Long allocationId) {
        allocationService.removeAllocation(allocationId);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}


