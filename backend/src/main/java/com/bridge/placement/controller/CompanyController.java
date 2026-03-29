package com.bridge.placement.controller;

import com.bridge.placement.dto.request.PlacementOfficerRequest;
import com.bridge.placement.dto.response.MessageResponse;
import com.bridge.placement.entity.Application;
import com.bridge.placement.entity.Company;
import com.bridge.placement.entity.PlacementOfficer;
import com.bridge.placement.enums.ApplicationStatus;
import com.bridge.placement.security.services.BridgeUserDetails;
import com.bridge.placement.service.ApplicationService;
import com.bridge.placement.service.CompanyService;
import com.bridge.placement.service.OfficerService;
import com.bridge.placement.repository.ApplicationRepository;
import com.bridge.placement.repository.PlacementOfficerRepository;
import com.bridge.placement.repository.JobRepository;
import com.bridge.placement.enums.JobStatus;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
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
    private final OfficerService officerService;
    private final ApplicationService applicationService;
    private final PlacementOfficerRepository placementOfficerRepository;
    private final JobRepository jobRepository;
    private final ApplicationRepository applicationRepository;

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

    @GetMapping("/company/job/{jobId}/applications")
    @PreAuthorize("hasRole('COMPANY')")
    public ResponseEntity<List<Application>> getJobApplications(
            @PathVariable Long jobId,
            @AuthenticationPrincipal BridgeUserDetails userDetails) {
        return ResponseEntity.ok(applicationService.getApplicationsForCompanyJob(userDetails.getId(), jobId));
    }

    @GetMapping("/company/selected-students")
    @PreAuthorize("hasRole('COMPANY')")
    public ResponseEntity<List<Map<String, Object>>> getSelectedStudents(
            @AuthenticationPrincipal BridgeUserDetails userDetails) {
        return ResponseEntity.ok(applicationService.getSelectedStudentsForCompany(userDetails.getId()));
    }

    @PutMapping("/company/application/{applicationId}/status")
    @PreAuthorize("hasRole('COMPANY')")
    public ResponseEntity<MessageResponse> updateApplicationStatus(
            @PathVariable Long applicationId,
            @RequestBody Map<String, Object> body,
            @AuthenticationPrincipal BridgeUserDetails userDetails) {
        String statusValue = String.valueOf(body.get("status"));
        if (statusValue == null || statusValue.isBlank() || "null".equalsIgnoreCase(statusValue)) {
            throw new RuntimeException("status is required");
        }

        ApplicationStatus status = ApplicationStatus.valueOf(statusValue.toUpperCase());
        return ResponseEntity.ok(applicationService.updateApplicationStatusForCompany(
                userDetails.getId(), applicationId, status));
    }

    @GetMapping("/company/dashboard")
    @PreAuthorize("hasRole('COMPANY')")
    public ResponseEntity<Map<String, Object>> getDashboardStats(
            @AuthenticationPrincipal BridgeUserDetails userDetails) {
        Map<String, Object> stats = new HashMap<>();
        List<PlacementOfficer> officers = placementOfficerRepository.findByCompanyId(userDetails.getId());
        stats.put("activeOfficers", officers.stream()
                .filter(PlacementOfficer::isActive)
                .filter(PlacementOfficer::isApproved)
                .count());
        stats.put("activeJobs", jobRepository.countByCompanyIdAndStatus(userDetails.getId(),
                com.bridge.placement.enums.JobStatus.OPEN));
        stats.put("applicationsReceived",
                applicationRepository.countByJobCompanyId(userDetails.getId()));
        stats.put("studentsHiredThisMonth", 0); // Requires month-based filter — future enhancement
        return ResponseEntity.ok(Map.of("stats", stats));
    }

    @PutMapping("/company/officer/{officerId}/deactivate")
    @PreAuthorize("hasRole('COMPANY')")
    public ResponseEntity<MessageResponse> deactivateOfficer(
            @PathVariable Long officerId,
            @AuthenticationPrincipal BridgeUserDetails userDetails) {
        return ResponseEntity.ok(companyService.deactivateOfficer(userDetails.getId(), officerId));
    }

    @PutMapping("/company/officer/{officerId}/activate")
    @PreAuthorize("hasRole('COMPANY')")
    public ResponseEntity<MessageResponse> activateOfficer(
            @PathVariable Long officerId,
            @AuthenticationPrincipal BridgeUserDetails userDetails) {
        return ResponseEntity.ok(companyService.activateOfficer(userDetails.getId(), officerId));
    }

    @PutMapping("/company/officer/{officerId}/reset-password")
    @PreAuthorize("hasRole('COMPANY')")
    public ResponseEntity<MessageResponse> resetOfficerPassword(
            @PathVariable Long officerId,
            @RequestBody java.util.Map<String, String> body,
            @AuthenticationPrincipal BridgeUserDetails userDetails) {
        String newPassword = body.get("newPassword");
        if (newPassword == null || newPassword.isBlank()) {
            throw new RuntimeException("newPassword is required");
        }
        officerService.resetOfficerPassword(userDetails.getId(), officerId, newPassword);
        return ResponseEntity.ok(new MessageResponse("Officer password has been reset. They will be required to change it on next login."));
    }
}
