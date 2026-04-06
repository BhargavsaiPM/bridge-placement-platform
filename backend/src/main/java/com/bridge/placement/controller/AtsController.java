package com.bridge.placement.controller;

import com.bridge.placement.dto.response.AtsScoreResponse;
import com.bridge.placement.entity.Job;
import com.bridge.placement.entity.User;
import com.bridge.placement.repository.JobRepository;
import com.bridge.placement.repository.UserRepository;
import com.bridge.placement.service.AtsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/ats")
@RequiredArgsConstructor
public class AtsController {

    private final AtsService atsService;
    private final JobRepository jobRepository;
    private final UserRepository userRepository;

    @GetMapping("/calculate/{jobId}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> calculateAtsScore(@PathVariable Long jobId, Authentication authentication) {
        try {
            String email = authentication.getName();
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            Job job = jobRepository.findById(jobId)
                    .orElseThrow(() -> new RuntimeException("Job not found"));

            AtsScoreResponse response = atsService.calculateAtsScore(user, job);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
