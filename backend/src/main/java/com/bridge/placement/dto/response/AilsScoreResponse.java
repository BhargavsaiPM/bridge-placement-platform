package com.bridge.placement.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Full AILS score response returned by GET /applications/{id}/score
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AilsScoreResponse {

    private Long applicationId;
    private Long jobId;
    private String jobTitle;
    private String applicantName;

    private Double ailsScore; // 0.0 – 100.0
    private String matchLevel; // LOW / MEDIUM / HIGH

    private List<String> missingSkills;
    private List<String> strongAreas;
    private List<String> improvementSuggestions;

    private String explanation; // Full human-readable breakdown

    private boolean exceptionFlag; // High-exp, low-score candidate

    // Score breakdown
    private Double skillMatchScore;
    private Double keywordScore;
    private Double experienceScore;
    private Double educationScore;
    private Double projectScore;
    private Double certificationBonus;
}
