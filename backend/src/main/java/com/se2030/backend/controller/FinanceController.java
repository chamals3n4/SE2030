package com.se2030.backend.controller;

import com.se2030.backend.dto.FinanceSummaryDTO;
import com.se2030.backend.model.FinanceEntry;
import com.se2030.backend.service.FinanceService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/finance")
@CrossOrigin(origins = "*")
public class FinanceController {

    @Autowired
    private FinanceService financeService;

    @PostMapping
    public ResponseEntity<FinanceEntry> create(@Valid @RequestBody FinanceEntry entry) {
        FinanceEntry saved = financeService.create(entry);
        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }

    @GetMapping("/by-project/{projectId}")
    public ResponseEntity<List<FinanceEntry>> getByProject(@PathVariable("projectId") Long projectId) {
        return new ResponseEntity<>(financeService.getByProject(projectId), HttpStatus.OK);
    }


    @GetMapping("/summary/{projectId}")
    public ResponseEntity<FinanceSummaryDTO> getSummary(@PathVariable("projectId") Long projectId) {
        Optional<FinanceSummaryDTO> dto = financeService.getSummary(projectId);
        return dto.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @PutMapping("/{id}")
    public ResponseEntity<FinanceEntry> update(@PathVariable("id") Long id, @Valid @RequestBody FinanceEntry entry) {
        try {
            FinanceEntry updated = financeService.update(id, entry);
            return new ResponseEntity<>(updated, HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable("id") Long id) {
        financeService.delete(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}


