package com.bridge.placement.controller;

import com.bridge.placement.dto.request.ForgotPasswordRequest;
import com.bridge.placement.dto.request.LoginRequest;
import com.bridge.placement.dto.request.RegisterCompanyRequest;
import com.bridge.placement.dto.request.RegisterUserRequest;
import com.bridge.placement.dto.request.ResetPasswordRequest;
import com.bridge.placement.dto.response.AuthResponse;
import com.bridge.placement.dto.response.MessageResponse;
import com.bridge.placement.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        return ResponseEntity.ok(authService.authenticateUser(loginRequest));
    }

    @PostMapping("/register-user")
    public ResponseEntity<MessageResponse> registerUser(@Valid @RequestBody RegisterUserRequest signUpRequest) {
        return ResponseEntity.ok(authService.registerUser(signUpRequest));
    }

    @PostMapping("/register-company")
    public ResponseEntity<MessageResponse> registerCompany(@Valid @RequestBody RegisterCompanyRequest signUpRequest) {
        return ResponseEntity.ok(authService.registerCompany(signUpRequest));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<MessageResponse> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        return ResponseEntity.ok(authService.forgotPassword(request.getEmail()));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<MessageResponse> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        return ResponseEntity
                .ok(authService.resetPassword(request.getEmail(), request.getOtp(), request.getNewPassword()));
    }
}
