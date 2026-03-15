package com.bridge.placement.controller;

import com.bridge.placement.dto.request.JobRequest;
import com.bridge.placement.dto.response.MessageResponse;
import com.bridge.placement.entity.Job;
import com.bridge.placement.security.services.BridgeUserDetails;
import com.bridge.placement.service.JobService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class JobController {

    private final JobService jobService;

    // ====== Officer Endpoints — READ ONLY ======
    // Officers do NOT create/update/close jobs.
    // Officers manage applications and interview slots only.

    @GetMapping("/officer/jobs")
    @PreAuthorize("hasRole('PLACEMENT_OFFICER')")
    public ResponseEntity<List<Job>> getJobsByOfficer(@AuthenticationPrincipal BridgeUserDetails userDetails) {
        return ResponseEntity.ok(jobService.getJobsByOfficer(userDetails.getId()));
    }

    // ====== Company Endpoints ======
    @PostMapping("/company/job")
    @PreAuthorize("hasRole('COMPANY')")
    public ResponseEntity<Job> postJobByCompany(
            @Valid @RequestBody JobRequest request,
            @AuthenticationPrincipal BridgeUserDetails userDetails) {
        return ResponseEntity.ok(jobService.createJobByCompany(userDetails.getId(), request));
    }

    @GetMapping("/company/jobs")
    @PreAuthorize("hasRole('COMPANY')")
    public ResponseEntity<List<Job>> getJobsByCompany(@AuthenticationPrincipal BridgeUserDetails userDetails) {
        return ResponseEntity.ok(jobService.getJobsByCompany(userDetails.getId()));
    }

    @PutMapping("/company/job/{jobId}")
    @PreAuthorize("hasRole('COMPANY')")
    public ResponseEntity<Job> updateJobByCompany(
            @PathVariable Long jobId,
            @Valid @RequestBody JobRequest request,
            @AuthenticationPrincipal BridgeUserDetails userDetails) {
        return ResponseEntity.ok(jobService.updateJobByCompany(userDetails.getId(), jobId, request));
    }

    @PutMapping("/company/job/{jobId}/close")
    @PreAuthorize("hasRole('COMPANY')")
    public ResponseEntity<MessageResponse> closeJobByCompany(
            @PathVariable Long jobId,
            @AuthenticationPrincipal BridgeUserDetails userDetails) {
        jobService.closeJobByCompany(userDetails.getId(), jobId);
        return ResponseEntity.ok(new MessageResponse("Job closed successfully"));
    }

    @DeleteMapping("/company/job/{jobId}")
    @PreAuthorize("hasRole('COMPANY')")
    public ResponseEntity<MessageResponse> deleteJobByCompany(
            @PathVariable Long jobId,
            @AuthenticationPrincipal BridgeUserDetails userDetails) {
        jobService.deleteJobByCompany(userDetails.getId(), jobId);
        return ResponseEntity.ok(new MessageResponse("Job deleted successfully"));
    }

    // ====== Public / User Endpoints ======

    @GetMapping("/jobs/search")
    public ResponseEntity<List<Job>> searchJobs(
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String type) {
        return ResponseEntity.ok(jobService.searchJobs(location, type));
    }

    @GetMapping("/jobs/{id}")
    public ResponseEntity<Job> getJobById(@PathVariable Long id) {
        return ResponseEntity.ok(jobService.getJob(id));
    }
}
