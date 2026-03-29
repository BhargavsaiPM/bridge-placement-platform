package com.bridge.placement.repository;

import com.bridge.placement.entity.Application;
import com.bridge.placement.enums.ApplicationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, Long> {
    Page<Application> findByJobId(Long jobId, Pageable pageable);

    List<Application> findByJobIdOrderByAppliedAtDesc(Long jobId);

    List<Application> findByJobCompanyIdAndApplicationStatusOrderByAppliedAtDesc(Long companyId, ApplicationStatus status);

    List<Application> findByUserId(Long userId);

    Optional<Application> findByUserIdAndJobId(Long userId, Long jobId);

    long countByJobId(Long jobId);

    long countByJobCompanyId(Long companyId);

    // Reports Queries
    @Query("SELECT COUNT(a) FROM Application a WHERE a.applicationStatus = 'SELECTED' AND EXTRACT(YEAR FROM a.appliedAt) = :year")
    Long countPlacedStudents(int year);
}
