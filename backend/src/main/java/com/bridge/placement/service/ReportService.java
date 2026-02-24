package com.bridge.placement.service;

import com.bridge.placement.repository.ApplicationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final ApplicationRepository applicationRepository;

    public Map<String, Object> generatePlacementReports() {
        Map<String, Object> stats = new HashMap<>();

        // 1. Students Placed This Year
        Long placedCount = applicationRepository.countPlacedStudents(LocalDate.now().getYear());
        stats.put("studentsPlacedCurrentYear", placedCount);

        // 2. Mock other stats for the skeleton
        stats.put("departmentWisePlacementPercentage", Map.of("CS", 85, "IT", 80, "ECE", 70));
        stats.put("offerPackageStatistics", Map.of("Highest", "24 LPA", "Average", "8 LPA", "Lowest", "4 LPA"));
        stats.put("interviewRoundPerformance", Map.of("Aptitude Pass Rate", "60%", "Technical Pass Rate", "40%"));

        return stats;
    }
}
