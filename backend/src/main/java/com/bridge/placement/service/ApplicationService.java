package com.bridge.placement.service;

import com.bridge.placement.dto.response.AilsScoreResponse;
import com.bridge.placement.dto.response.MessageResponse;
import com.bridge.placement.entity.Application;
import com.bridge.placement.entity.Job;
import com.bridge.placement.entity.User;
import com.bridge.placement.enums.ApplicationStatus;
import com.bridge.placement.enums.NotificationType;
import com.bridge.placement.repository.ApplicationRepository;
import com.bridge.placement.repository.JobRepository;
import com.bridge.placement.repository.UserRepository;
import com.bridge.placement.service.ails.AilsResult;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final JobRepository jobRepository;
    private final UserRepository userRepository;
    private final AilsService ailsService;
    private final NotificationService notificationService;
    private final ObjectMapper objectMapper;

    @Transactional
    public MessageResponse applyForJob(Long userId, Long jobId) {
        if (applicationRepository.findByUserIdAndJobId(userId, jobId).isPresent()) {
            return new MessageResponse("You have already applied for this job!");
        }

        Job job = jobRepository.findById(jobId).orElseThrow(() -> new RuntimeException("Job not found"));
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));

        // === Real AILS Calculation ===
        AilsResult ails = ailsService.calculateScore(user, job);

        // Serialize lists to JSON for storage
        String explanationJson = buildExplanationJson(ails);

        Application application = new Application();
        application.setJob(job);
        application.setUser(user);
        application.setAppliedAt(LocalDateTime.now());
        application.setApplicationStatus(ApplicationStatus.APPLIED);
        application.setAilsScore(ails.getScore());
        application.setExplanation(explanationJson);
        application.setImprovementSuggestions(String.join(" | ", ails.getImprovementSuggestions()));
        application.setExceptionFlag(ails.isExceptionFlag());

        applicationRepository.save(application);

        // Notify User
        notificationService.createNotification(
                user.getEmail(),
                "Application Submitted",
                "You applied for " + job.getTitle() + " | AILS Score: " + ails.getScore() + "/100 ("
                        + ails.getMatchLevel() + ")",
                NotificationType.STATUS_CHANGE);

        return new MessageResponse(String.format(
                "Applied successfully! Your AILS Score: %.1f/100 — Match Level: %s",
                ails.getScore(), ails.getMatchLevel()));
    }

    public List<Application> getApplicationsForJob(Long jobId) {
        return applicationRepository.findByJobId(jobId);
    }

    /**
     * Returns the full AILS score breakdown for an application.
     */
    public AilsScoreResponse getAilsScore(Long applicationId) {
        Application app = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Application not found"));

        // Re-compute for live/fresh results if needed,
        // but returning stored result is efficient and consistent
        return AilsScoreResponse.builder()
                .applicationId(app.getId())
                .jobId(app.getJob().getId())
                .jobTitle(app.getJob().getTitle())
                .applicantName(app.getUser().getName())
                .ailsScore(app.getAilsScore())
                .matchLevel(deriveMatchLevel(app.getAilsScore()))
                .explanation(app.getExplanation())
                .improvementSuggestions(
                        app.getImprovementSuggestions() != null
                                ? List.of(app.getImprovementSuggestions().split(" \\| "))
                                : List.of())
                .exceptionFlag(app.isExceptionFlag())
                .build();
    }

    @Transactional
    public MessageResponse updateApplicationStatus(Long applicationId, ApplicationStatus status) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Application not found"));

        application.setApplicationStatus(status);
        applicationRepository.save(application);

        notificationService.createNotification(
                application.getUser().getEmail(),
                "Application Status Update",
                "Your application for " + application.getJob().getTitle() + " is now " + status,
                status == ApplicationStatus.SELECTED ? NotificationType.SELECTION : NotificationType.REJECTION);

        return new MessageResponse("Status Updated to " + status);
    }

    private String buildExplanationJson(AilsResult ails) {
        try {
            var map = new java.util.LinkedHashMap<String, Object>();
            map.put("score", ails.getScore());
            map.put("matchLevel", ails.getMatchLevel());
            map.put("summary", ails.getExplanation());
            map.put("missingSkills", ails.getMissingSkills());
            map.put("strongAreas", ails.getStrongAreas());
            map.put("breakdown", new java.util.LinkedHashMap<String, Object>() {
                {
                    put("skillMatch", ails.getSkillMatchScore());
                    put("keywordSim", ails.getKeywordScore());
                    put("experience", ails.getExperienceScore());
                    put("education", ails.getEducationScore());
                    put("projectRel", ails.getProjectScore());
                    put("certBonus", ails.getCertificationBonus());
                }
            });
            return objectMapper.writeValueAsString(map);
        } catch (Exception e) {
            return ails.getExplanation(); // fallback to plain text
        }
    }

    private String deriveMatchLevel(Double score) {
        if (score == null)
            return "UNKNOWN";
        if (score >= 70)
            return "HIGH";
        if (score >= 45)
            return "MEDIUM";
        return "LOW";
    }
}
