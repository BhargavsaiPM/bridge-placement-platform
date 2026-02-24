package com.bridge.placement.service.ails;

import lombok.Builder;
import lombok.Data;

import java.util.List;

/**
 * Internal model representing the full AILS scoring result.
 * Passed from AilsService to ApplicationService.
 */
@Data
@Builder
public class AilsResult {

    private double score; // 0.0 – 100.0
    private String matchLevel; // LOW / MEDIUM / HIGH
    private String explanation; // Human-readable summary
    private List<String> missingSkills;
    private List<String> strongAreas;
    private List<String> improvementSuggestions;
    private boolean exceptionFlag; // High experience, low score

    // Breakdown (for transparency)
    private double skillMatchScore; // out of 40
    private double keywordScore; // out of 20
    private double experienceScore; // out of 15
    private double educationScore; // out of 10
    private double projectScore; // out of 10
    private double certificationBonus; // out of 5
}
