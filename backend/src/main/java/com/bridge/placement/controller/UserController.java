package com.bridge.placement.controller;

import com.bridge.placement.dto.request.UpdateUserProfileRequest;
import com.bridge.placement.entity.Application;
import com.bridge.placement.entity.User;
import com.bridge.placement.repository.ApplicationRepository;
import com.bridge.placement.security.services.BridgeUserDetails;
import com.bridge.placement.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/user")
@RequiredArgsConstructor
@PreAuthorize("hasRole('USER')")
public class UserController {

    private final UserService userService;
    private final ApplicationRepository applicationRepository;

    @GetMapping("/profile")
    public ResponseEntity<User> getProfile(@AuthenticationPrincipal BridgeUserDetails userDetails) {
        return ResponseEntity.ok(userService.getUserProfile(userDetails.getId()));
    }

    @PutMapping("/profile")
    public ResponseEntity<User> updateProfile(
            @Valid @RequestBody UpdateUserProfileRequest request,
            @AuthenticationPrincipal BridgeUserDetails userDetails) {
        return ResponseEntity.ok(userService.updateUserProfile(userDetails.getId(), request));
    }

    @GetMapping("/applications")
    public ResponseEntity<List<Application>> getApplications(@AuthenticationPrincipal BridgeUserDetails userDetails) {
        return ResponseEntity.ok(applicationRepository.findByUserId(userDetails.getId()));
    }
}
