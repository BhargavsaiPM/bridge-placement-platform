package com.bridge.placement.repository;

import com.bridge.placement.entity.Application;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, Long> {
    List<Application> findByJobId(Long jobId);

    List<Application> findByUserId(Long userId);

    Optional<Application> findByUserIdAndJobId(Long userId, Long jobId);

    // Reports Queries
    @Query("SELECT COUNT(a) FROM Application a WHERE a.applicationStatus = 'SELECTED' AND YEAR(a.appliedAt) = :year")
    Long countPlacedStudents(int year);
}
