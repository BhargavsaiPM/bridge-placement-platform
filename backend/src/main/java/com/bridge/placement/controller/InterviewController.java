package com.bridge.placement.controller;

import com.bridge.placement.entity.InterviewSlot;
import com.bridge.placement.security.services.BridgeUserDetails;
import com.bridge.placement.service.InterviewSlotService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * N7: Interview scheduling controller.
 * Officers schedule interviews. Students can view their interview details.
 */
@RestController
@RequiredArgsConstructor
public class InterviewController {

    private final InterviewSlotService interviewSlotService;

    /**
     * POST /officer/application/{id}/schedule-interview
     * Body: { "scheduledAt": "2026-04-01T10:00:00", "mode": "ONLINE",
     *         "meetingLink": "https://meet.google.com/xxx", "additionalNotes": "..." }
     */
    @PostMapping("/officer/application/{applicationId}/schedule-interview")
    @PreAuthorize("hasRole('PLACEMENT_OFFICER')")
    public ResponseEntity<InterviewSlot> scheduleInterview(
            @PathVariable Long applicationId,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal BridgeUserDetails userDetails) {
        return ResponseEntity.ok(
                interviewSlotService.scheduleInterview(userDetails.getId(), applicationId, body)
        );
    }

    /**
     * GET /officer/application/{id}/interview-slots
     * View all interview slots for an application (officer view).
     */
    @GetMapping("/officer/application/{applicationId}/interview-slots")
    @PreAuthorize("hasRole('PLACEMENT_OFFICER')")
    public ResponseEntity<List<InterviewSlot>> getSlots(
            @PathVariable Long applicationId,
            @AuthenticationPrincipal BridgeUserDetails userDetails) {
        return ResponseEntity.ok(interviewSlotService.getInterviewSlots(userDetails.getId(), applicationId));
    }

    /**
     * GET /user/application/{id}/interview
     * Student views their upcoming interview details.
     */
    @GetMapping("/user/application/{applicationId}/interview")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<InterviewSlot> getMyInterview(
            @PathVariable Long applicationId,
            @AuthenticationPrincipal BridgeUserDetails userDetails) {
        return ResponseEntity.ok(interviewSlotService.getLatestSlot(userDetails.getId(), applicationId));
    }
}
