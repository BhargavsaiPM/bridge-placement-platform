package com.bridge.placement.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AtsScoreResponse {
    private int score;
    private String matchPercentage;
    private List<String> missingSkills;
    private List<String> matchingSkills;
    private String generalFeedback;
}
