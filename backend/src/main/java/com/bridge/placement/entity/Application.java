package com.bridge.placement.entity;

import com.bridge.placement.enums.ApplicationStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "applications")
@Getter
@Setter
public class Application extends BaseEntity {

    @ManyToOne(optional = false)
    @JoinColumn(name = "job_id", nullable = false)
    private Job job;

    @ManyToOne(optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private LocalDateTime appliedAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ApplicationStatus applicationStatus = ApplicationStatus.APPLIED;

    private Double ailsScore;

    @Column(columnDefinition = "TEXT")
    private String explanation; // AI Explanation

    @Column(columnDefinition = "TEXT")
    private String remarksByOfficer;

    private boolean exceptionFlag = false;

    // AI generated
    @Column(columnDefinition = "TEXT")
    private String improvementSuggestions;
}
