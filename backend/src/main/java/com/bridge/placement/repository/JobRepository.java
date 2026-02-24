package com.bridge.placement.repository;

import com.bridge.placement.entity.Job;
import com.bridge.placement.enums.JobStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JobRepository extends JpaRepository<Job, Long> {
    List<Job> findByCompanyId(Long companyId);

    List<Job> findByStatus(JobStatus status);

    long countByStatus(JobStatus status);
}
