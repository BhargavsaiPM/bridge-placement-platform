package com.bridge.placement.controller;

import com.bridge.placement.dto.response.PublicStatsResponse;
import com.bridge.placement.service.PublicService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/public")
@RequiredArgsConstructor
public class PublicController {

    private final PublicService publicService;

    /**
     * GET /api/public/stats
     * Unauthenticated — used by the landing page.
     */
    @GetMapping("/stats")
    public ResponseEntity<PublicStatsResponse> getStats() {
        return ResponseEntity.ok(publicService.getStats());
    }
}
