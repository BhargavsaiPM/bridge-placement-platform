package com.bridge.placement.controller;

import com.bridge.placement.dto.request.UpdateOfficerProfileRequest;
import com.bridge.placement.entity.PlacementOfficer;
import com.bridge.placement.security.services.BridgeUserDetails;
import com.bridge.placement.service.OfficerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/officer")
@RequiredArgsConstructor
@PreAuthorize("hasRole('PLACEMENT_OFFICER')")
public class OfficerController {

    private final OfficerService officerService;

    @GetMapping("/profile")
    public ResponseEntity<PlacementOfficer> getProfile(@AuthenticationPrincipal BridgeUserDetails userDetails) {
        return ResponseEntity.ok(officerService.getOfficerProfile(userDetails.getId()));
    }

    @PutMapping("/profile")
    public ResponseEntity<PlacementOfficer> updateProfile(
            @Valid @RequestBody UpdateOfficerProfileRequest request,
            @AuthenticationPrincipal BridgeUserDetails userDetails) {
        return ResponseEntity.ok(officerService.updateOfficerProfile(userDetails.getId(), request));
    }
}
