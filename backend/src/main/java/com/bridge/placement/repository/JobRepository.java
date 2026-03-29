package com.bridge.placement.repository;

import com.bridge.placement.entity.Job;
import com.bridge.placement.enums.JobStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JobRepository extends JpaRepository<Job, Long> {
    List<Job> findByCompanyId(Long companyId);

    List<Job> findByStatus(JobStatus status);

    long countByStatus(JobStatus status);

    long countByCompanyIdAndStatus(Long companyId, JobStatus status);

    @Query("""
            SELECT DISTINCT j
            FROM Job j
            JOIN j.assignedOfficers assignedOfficer
            WHERE j.company.id = :companyId
              AND assignedOfficer.id = :officerId
            ORDER BY j.createdAt DESC
            """)
    List<Job> findVisibleJobsForOfficer(@Param("companyId") Long companyId, @Param("officerId") Long officerId);
}
