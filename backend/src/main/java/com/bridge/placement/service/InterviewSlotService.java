package com.bridge.placement.service;

import com.bridge.placement.dto.response.MessageResponse;
import com.bridge.placement.entity.Application;
import com.bridge.placement.entity.InterviewSlot;
import com.bridge.placement.entity.PlacementOfficer;
import com.bridge.placement.enums.InterviewMode;
import com.bridge.placement.repository.ApplicationRepository;
import com.bridge.placement.repository.InterviewSlotRepository;
import com.bridge.placement.repository.PlacementOfficerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * N7: Service to manage interview scheduling for applicants.
 * Officers schedule interviews; students can view their scheduled slot.
 */
@Service
@RequiredArgsConstructor
public class InterviewSlotService {

    private final InterviewSlotRepository interviewSlotRepository;
    private final ApplicationRepository applicationRepository;
    private final PlacementOfficerRepository placementOfficerRepository;
    private final NotificationService notificationService;

    /**
     * Schedule an interview slot for an application.
     * Officer provides: scheduledAt, mode (ONLINE/OFFLINE), meetingLink or venue, notes.
     */
    @Transactional
    public InterviewSlot scheduleInterview(Long officerId, Long applicationId, Map<String, String> body) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Application not found"));

        PlacementOfficer officer = placementOfficerRepository.findById(officerId)
                .orElseThrow(() -> new RuntimeException("Officer not found"));
        validateOfficerAccess(application, officer);

        InterviewSlot slot = new InterviewSlot();
        slot.setApplication(application);
        slot.setScheduledBy(officer);
        slot.setScheduledAt(LocalDateTime.parse(body.get("scheduledAt"))); // ISO-8601: 2026-04-01T10:00:00
        slot.setMode(InterviewMode.valueOf(body.get("mode").toUpperCase()));
        slot.setMeetingLink(body.get("meetingLink"));
        slot.setVenue(body.get("venue"));
        slot.setAdditionalNotes(body.get("additionalNotes"));

        InterviewSlot saved = interviewSlotRepository.save(slot);

        // Notify the applicant
        notificationService.createNotification(
                application.getUser().getEmail(),
                "Interview Scheduled",
                "Your interview for " + application.getJob().getTitle() +
                " is scheduled on " + slot.getScheduledAt() +
                " (" + slot.getMode() + ")",
                com.bridge.placement.enums.NotificationType.STATUS_CHANGE
        );

        return saved;
    }

    /**
     * Get all interview slots created by an officer's company for an application.
     */
    public List<InterviewSlot> getInterviewSlots(Long officerId, Long applicationId) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Application not found"));
        PlacementOfficer officer = placementOfficerRepository.findById(officerId)
                .orElseThrow(() -> new RuntimeException("Officer not found"));
        validateOfficerAccess(application, officer);
        return interviewSlotRepository.findByApplicationIdOrderByScheduledAtAsc(applicationId);
    }

    /**
     * Get the latest interview slot for an application (for student view).
     */
    public InterviewSlot getLatestSlot(Long userId, Long applicationId) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Application not found"));

        if (!application.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized access to this interview.");
        }

        return interviewSlotRepository.findTopByApplicationIdOrderByCreatedAtDesc(applicationId)
                .orElseThrow(() -> new RuntimeException("No interview scheduled yet for this application"));
    }

    private void validateOfficerAccess(Application application, PlacementOfficer officer) {
        boolean assignedToJob = application.getJob().getAssignedOfficers().stream()
                .anyMatch(assignedOfficer -> assignedOfficer.getId().equals(officer.getId()));

        if (!officer.isApproved() || !officer.isActive()) {
            throw new RuntimeException("Officer account is not active.");
        }
        if (!application.getJob().getCompany().getId().equals(officer.getCompany().getId()) || !assignedToJob) {
            throw new RuntimeException("Unauthorized access to this application.");
        }
    }
}
