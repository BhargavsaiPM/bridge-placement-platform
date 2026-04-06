package com.bridge.placement.controller;

import com.bridge.placement.dto.response.AilsScoreResponse;
import com.bridge.placement.dto.response.MessageResponse;
import com.bridge.placement.entity.Application;
import com.bridge.placement.enums.ApplicationStatus;
import com.bridge.placement.security.services.BridgeUserDetails;
import com.bridge.placement.service.ApplicationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

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
    public ResponseEntity<Map<String, Object>> getApplications(
            @PathVariable Long jobId,
            @AuthenticationPrincipal BridgeUserDetails userDetails,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "100") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "appliedAt"));
        Page<Application> appPage = applicationService.getApplicationsForOfficerJob(userDetails.getId(), jobId, pageable);
        
        Map<String, Object> response = new HashMap<>();
        response.put("applications", appPage.getContent());
        response.put("currentPage", appPage.getNumber());
        response.put("totalItems", appPage.getTotalElements());
        response.put("totalPages", appPage.getTotalPages());
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/officer/application/{id}")
    @PreAuthorize("hasRole('PLACEMENT_OFFICER')")
    public ResponseEntity<Application> getApplication(
            @PathVariable Long id,
            @AuthenticationPrincipal BridgeUserDetails userDetails) {
        return ResponseEntity.ok(applicationService.getApplicationForOfficer(userDetails.getId(), id));
    }

    @PutMapping("/officer/application/status")
    @PreAuthorize("hasRole('PLACEMENT_OFFICER')")
    public ResponseEntity<MessageResponse> updateStatus(
            @RequestParam Long applicationId,
            @RequestParam String status,
            @AuthenticationPrincipal BridgeUserDetails userDetails) {
        if (status == null || status.isBlank()) {
            return ResponseEntity.badRequest().body(new MessageResponse("status is required"));
        }

        ApplicationStatus parsedStatus;
        try {
            parsedStatus = ApplicationStatus.valueOf(status.trim().toUpperCase());
        } catch (IllegalArgumentException exception) {
            return ResponseEntity.badRequest().body(new MessageResponse("Invalid application status: " + status));
        }

        return ResponseEntity.ok(applicationService.updateApplicationStatusForOfficer(
                userDetails.getId(), applicationId, parsedStatus));
    }

    /**
     * PUT /officer/application/{id}/remark — B14 fix
     * Allows officer to write remarks on an application.
     */
    @PutMapping("/officer/application/{id}/remark")
    @PreAuthorize("hasRole('PLACEMENT_OFFICER')")
    public ResponseEntity<MessageResponse> setRemark(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal BridgeUserDetails userDetails) {
        return ResponseEntity.ok(applicationService.setRemarkForOfficer(
                userDetails.getId(), id, body.get("remark")));
    }

    /**
     * GET /applications/{id}/score
     * Returns the full ATS score breakdown for an application.
     */
    @GetMapping("/applications/{id}/score")
    @PreAuthorize("hasAnyRole('USER', 'PLACEMENT_OFFICER', 'SUPER_ADMIN')")
    public ResponseEntity<AilsScoreResponse> getAilsScore(@PathVariable Long id) {
        return ResponseEntity.ok(applicationService.getAilsScore(id));
    }
}
