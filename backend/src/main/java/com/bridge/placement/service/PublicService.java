package com.bridge.placement.service;

import com.bridge.placement.dto.response.PublicStatsResponse;
import com.bridge.placement.enums.JobStatus;
import com.bridge.placement.repository.ApplicationRepository;
import com.bridge.placement.repository.CompanyRepository;
import com.bridge.placement.repository.JobRepository;
import com.bridge.placement.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class PublicService {

    private final UserRepository userRepository;
    private final CompanyRepository companyRepository;
    private final JobRepository jobRepository;
    private final ApplicationRepository applicationRepository;

    public PublicStatsResponse getStats() {
        long totalUsers = userRepository.count();
        long totalCompanies = companyRepository.count();
        long activeJobs = jobRepository.findByStatus(JobStatus.OPEN).size();
        long studentsPlaced = applicationRepository.countPlacedStudents(LocalDate.now().getYear());

        return PublicStatsResponse.builder()
                .totalUsers(totalUsers)
                .totalCompanies(totalCompanies)
                .activeJobs(activeJobs)
                .studentsPlaced(studentsPlaced)
                .build();
    }
}
