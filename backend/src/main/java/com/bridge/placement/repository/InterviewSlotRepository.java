package com.bridge.placement.repository;

import com.bridge.placement.entity.InterviewSlot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InterviewSlotRepository extends JpaRepository<InterviewSlot, Long> {

    List<InterviewSlot> findByApplicationIdOrderByScheduledAtAsc(Long applicationId);

    Optional<InterviewSlot> findTopByApplicationIdOrderByCreatedAtDesc(Long applicationId);
}
