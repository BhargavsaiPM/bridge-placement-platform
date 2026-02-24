package com.bridge.placement.controller;

import com.bridge.placement.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequiredArgsConstructor
public class ReportsController {

    private final ReportService reportService;

    @GetMapping("/officer/reports/placement")
    @PreAuthorize("hasRole('PLACEMENT_OFFICER')")
    public ResponseEntity<Map<String, Object>> getPlacementReports() {
        return ResponseEntity.ok(reportService.generatePlacementReports());
    }
}
