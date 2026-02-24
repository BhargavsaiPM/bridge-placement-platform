package com.bridge.placement.controller;

import com.bridge.placement.dto.response.AilsScoreResponse;
import com.bridge.placement.dto.response.MessageResponse;
import com.bridge.placement.entity.Application;
import com.bridge.placement.enums.ApplicationStatus;
import com.bridge.placement.security.services.BridgeUserDetails;
import com.bridge.placement.service.ApplicationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class ApplicationController {

    private final ApplicationService applicationService;

    @PostMapping("/user/apply/{jobId}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<MessageResponse> applyForJob(
            @PathVariable Long jobId,
            @AuthenticationPrincipal BridgeUserDetails userDetails) {
        return ResponseEntity.ok(applicationService.applyForJob(userDetails.getId(), jobId));
    }

    @GetMapping("/officer/applications/{jobId}")
    @PreAuthorize("hasRole('PLACEMENT_OFFICER')")
    public ResponseEntity<List<Application>> getApplications(@PathVariable Long jobId) {
        return ResponseEntity.ok(applicationService.getApplicationsForJob(jobId));
    }

    @PutMapping("/officer/application/status")
    @PreAuthorize("hasRole('PLACEMENT_OFFICER')")
    public ResponseEntity<MessageResponse> updateStatus(
            @RequestParam Long applicationId,
            @RequestParam ApplicationStatus status) {
        return ResponseEntity.ok(applicationService.updateApplicationStatus(applicationId, status));
    }

    /**
     * GET /api/applications/{id}/score
     * Returns the full AILS score breakdown for an application.
     * Accessible by the applicant (USER) or placement officers.
     */
    @GetMapping("/applications/{id}/score")
    @PreAuthorize("hasAnyRole('USER', 'PLACEMENT_OFFICER', 'ADMIN')")
    public ResponseEntity<AilsScoreResponse> getAilsScore(@PathVariable Long id) {
        return ResponseEntity.ok(applicationService.getAilsScore(id));
    }
}
