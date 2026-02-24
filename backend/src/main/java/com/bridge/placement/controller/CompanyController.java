package com.bridge.placement.controller;

import com.bridge.placement.dto.request.PlacementOfficerRequest;
import com.bridge.placement.dto.response.MessageResponse;
import com.bridge.placement.entity.Company;
import com.bridge.placement.entity.PlacementOfficer;
import com.bridge.placement.security.services.BridgeUserDetails;
import com.bridge.placement.service.CompanyService;
import com.bridge.placement.repository.PlacementOfficerRepository;
import com.bridge.placement.repository.JobRepository;
import com.bridge.placement.enums.JobStatus;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import com.bridge.placement.dto.request.UpdateCompanyProfileRequest;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class CompanyController {

    private final CompanyService companyService;
    private final PlacementOfficerRepository placementOfficerRepository;
    private final JobRepository jobRepository;

    // Company Endpoints
    @PostMapping("/company/create-placement-officer")
    @PreAuthorize("hasRole('COMPANY')")
    public ResponseEntity<MessageResponse> createPlacementOfficer(
            @Valid @RequestBody PlacementOfficerRequest request,
            @AuthenticationPrincipal BridgeUserDetails userDetails) {
        return ResponseEntity.ok(companyService.createPlacementOfficer(userDetails.getId(), request));
    }

    @GetMapping("/company/profile")
    @PreAuthorize("hasRole('COMPANY')")
    public ResponseEntity<Company> getCompanyProfile(@AuthenticationPrincipal BridgeUserDetails userDetails) {
        return ResponseEntity.ok(companyService.getCompanyById(userDetails.getId()));
    }

    @PutMapping("/company/profile")
    @PreAuthorize("hasRole('COMPANY')")
    public ResponseEntity<Company> updateCompanyProfile(
            @Valid @RequestBody UpdateCompanyProfileRequest request,
            @AuthenticationPrincipal BridgeUserDetails userDetails) {
        return ResponseEntity.ok(companyService.updateCompanyProfile(userDetails.getId(), request));
    }

    @GetMapping("/company/officers")
    @PreAuthorize("hasRole('COMPANY')")
    public ResponseEntity<List<PlacementOfficer>> getOfficers(@AuthenticationPrincipal BridgeUserDetails userDetails) {
        return ResponseEntity.ok(placementOfficerRepository.findByCompanyId(userDetails.getId()));
    }

    @GetMapping("/company/dashboard")
    @PreAuthorize("hasRole('COMPANY')")
    public ResponseEntity<Map<String, Object>> getDashboardStats(
            @AuthenticationPrincipal BridgeUserDetails userDetails) {
        Map<String, Object> stats = new HashMap<>();
        List<PlacementOfficer> officers = placementOfficerRepository.findByCompanyId(userDetails.getId());
        stats.put("activeOfficers", officers.stream().filter(PlacementOfficer::isActive).count());
        stats.put("activeJobs", 0); // Will be populated when company-job relationship is fully wired
        stats.put("applicationsReceived", 0);
        stats.put("studentsHiredThisMonth", 0);
        return ResponseEntity.ok(Map.of("stats", stats));
    }
}
