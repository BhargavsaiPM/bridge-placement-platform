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
import java.util.List;
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
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Application> appPage = applicationService.getApplicationsForJob(jobId, pageable);
        
        Map<String, Object> response = new HashMap<>();
        response.put("applications", appPage.getContent());
        response.put("currentPage", appPage.getNumber());
        response.put("totalItems", appPage.getTotalElements());
        response.put("totalPages", appPage.getTotalPages());
        
        return ResponseEntity.ok(response);
    }

    @PutMapping("/officer/application/status")
    @PreAuthorize("hasRole('PLACEMENT_OFFICER')")
    public ResponseEntity<MessageResponse> updateStatus(
            @RequestParam Long applicationId,
            @RequestParam ApplicationStatus status) {
        return ResponseEntity.ok(applicationService.updateApplicationStatus(applicationId, status));
    }

    /**
     * PUT /officer/application/{id}/remark — B14 fix
     * Allows officer to write remarks on an application.
     */
    @PutMapping("/officer/application/{id}/remark")
    @PreAuthorize("hasRole('PLACEMENT_OFFICER')")
    public ResponseEntity<MessageResponse> setRemark(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(applicationService.setRemark(id, body.get("remark")));
    }

    /**
     * GET /applications/{id}/score
     * Returns the full ATS score breakdown for an application.
     */
    @GetMapping("/applications/{id}/score")
    @PreAuthorize("hasAnyRole('USER', 'PLACEMENT_OFFICER', 'ADMIN')")
    public ResponseEntity<AilsScoreResponse> getAilsScore(@PathVariable Long id) {
        return ResponseEntity.ok(applicationService.getAilsScore(id));
    }
}
