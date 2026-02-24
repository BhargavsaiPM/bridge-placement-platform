package com.bridge.placement.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PublicStatsResponse {
    private long totalUsers;
    private long totalCompanies;
    private long activeJobs;
    private long studentsPlaced;
}
