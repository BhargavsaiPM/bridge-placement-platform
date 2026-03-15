package com.bridge.placement.entity;

import com.bridge.placement.enums.InterviewMode;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

/**
 * N7: Represents an interview slot scheduled by a Placement Officer for an application.
 * Officers can schedule ONLINE or OFFLINE interviews with a link/location.
 */
@Entity
@Table(name = "interview_slots")
@Data
public class InterviewSlot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "application_id", nullable = false)
    private Application application;

    @Column(nullable = false)
    private LocalDateTime scheduledAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private InterviewMode mode; // ONLINE, OFFLINE

    @Column
    private String meetingLink; // For ONLINE interviews (Google Meet / Zoom link)

    @Column
    private String venue;       // For OFFLINE interviews (address/room)

    @Column(length = 500)
    private String additionalNotes;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "scheduled_by_officer_id")
    private PlacementOfficer scheduledBy;

    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}
