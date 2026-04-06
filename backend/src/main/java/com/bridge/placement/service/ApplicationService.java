package com.bridge.placement.service;

import com.bridge.placement.dto.response.AilsScoreResponse;
import com.bridge.placement.dto.response.MessageResponse;
import com.bridge.placement.entity.Application;
import com.bridge.placement.entity.Job;
import com.bridge.placement.entity.PlacementOfficer;
import com.bridge.placement.entity.User;
import com.bridge.placement.enums.ApplicationStatus;
import com.bridge.placement.enums.JobStatus;
import com.bridge.placement.enums.NotificationType;
import com.bridge.placement.repository.ApplicationRepository;
import com.bridge.placement.repository.JobRepository;
import com.bridge.placement.repository.PlacementOfficerRepository;
import com.bridge.placement.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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
    private final PlacementOfficerRepository placementOfficerRepository;
    private final NotificationService notificationService;
    private final AilsService ailsService;

    @Transactional
    public MessageResponse applyForJob(Long userId, Long jobId) {
        if (applicationRepository.findByUserIdAndJobId(userId, jobId).isPresent()) {
            return new MessageResponse("You have already applied for this job!");
        }

        Job job = jobRepository.findById(jobId).orElseThrow(() -> new RuntimeException("Job not found"));
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        validateEligibility(user, job);

        Application application = new Application();
        application.setJob(job);
        application.setUser(user);
        application.setAppliedAt(LocalDateTime.now());
        application.setApplicationStatus(ApplicationStatus.APPLIED);
        populateAilsFields(application, user, job);

        applicationRepository.save(application);

        notificationService.createNotification(
                user.getEmail(),
                "Application Submitted",
                "You applied for " + job.getTitle() + ". Your application is now pending review.",
                NotificationType.STATUS_CHANGE);

        return new MessageResponse("Applied successfully! Your application is now pending review.");
    }

    public Page<Application> getApplicationsForJob(Long jobId, Pageable pageable) {
        return applicationRepository.findByJobId(jobId, pageable);
    }

    public Page<Application> getApplicationsForOfficerJob(Long officerId, Long jobId, Pageable pageable) {
        validateOfficerAccessToJob(officerId, jobId);
        return applicationRepository.findByJobId(jobId, pageable);
    }

    public Application getApplicationForOfficer(Long officerId, Long applicationId) {
        return getAccessibleApplicationForOfficer(officerId, applicationId);
    }

    public List<Application> getApplicationsForCompanyJob(Long companyId, Long jobId) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));

        if (!job.getCompany().getId().equals(companyId)) {
            throw new RuntimeException("Unauthorized access to this job.");
        }

        return applicationRepository.findByJobIdOrderByAppliedAtDesc(jobId);
    }

    public List<java.util.Map<String, Object>> getSelectedStudentsForCompany(Long companyId) {
        return applicationRepository
                .findByJobCompanyIdAndApplicationStatusOrderByAppliedAtDesc(companyId, ApplicationStatus.SELECTED)
                .stream()
                .map(application -> {
                    java.util.Map<String, Object> entry = new java.util.LinkedHashMap<>();
                    entry.put("id", application.getId());
                    entry.put("name", application.getStudentName());
                    entry.put("email", application.getStudentEmail());
                    entry.put("mobile", application.getStudentMobile());
                    entry.put("role", application.getJob() != null ? application.getJob().getTitle() : null);
                    entry.put("salaryRange", application.getJob() != null ? application.getJob().getSalaryRange() : null);
                    entry.put("joiningDate", null);
                    return entry;
                })
                .toList();
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
                .applicantName(app.getUser().getFullName())
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

        // B15 Fix: Map each status to the correct notification type
        NotificationType notifType = switch (status) {
            case SELECTED -> NotificationType.SELECTION;
            case REJECTED -> NotificationType.REJECTION;
            default -> NotificationType.STATUS_CHANGE; // APPLIED, SHORTLISTED, INTERVIEW, TECHNICAL_ROUND
        };

        notificationService.createNotification(
                application.getUser().getEmail(),
                "Application Status Update",
                "Your application for " + application.getJob().getTitle() + " is now " + status,
                notifType);

        return new MessageResponse("Status Updated to " + status);
    }

    @Transactional
    public MessageResponse updateApplicationStatusForCompany(Long companyId, Long applicationId, ApplicationStatus status) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Application not found"));

        if (!application.getJob().getCompany().getId().equals(companyId)) {
            throw new RuntimeException("Unauthorized access to this application.");
        }

        return updateApplicationStatus(applicationId, status);
    }

    @Transactional
    public MessageResponse updateApplicationStatusForOfficer(Long officerId, Long applicationId, ApplicationStatus status) {
        Application application = getAccessibleApplicationForOfficer(officerId, applicationId);
        return updateApplicationStatus(application.getId(), status);
    }

    private void validateEligibility(User user, Job job) {
        if (!user.isApproved()) {
            throw new RuntimeException("Your profile is not approved by admin yet.");
        }
        if (user.isBlocked()) {
            throw new RuntimeException("Your profile is blocked.");
        }
        if (job.isBlockedByAdmin() || job.getStatus() != JobStatus.OPEN) {
            throw new RuntimeException("This job is not accepting applications right now.");
        }
        if (job.getApplicationDeadline() != null && job.getApplicationDeadline().isBefore(java.time.LocalDate.now())) {
            throw new RuntimeException("Application deadline has already passed.");
        }
        if (job.getMaxApplicants() != null && applicationRepository.countByJobId(job.getId()) >= job.getMaxApplicants()) {
            throw new RuntimeException("This job has already reached the maximum number of applicants.");
        }
        if (user.getResumeUrl() == null || user.getResumeUrl().isBlank()) {
            throw new RuntimeException("Resume is missing in your profile.");
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

    private void populateAilsFields(Application application, User user, Job job) {
        try {
            var result = ailsService.calculateScore(user, job);
            application.setAilsScore(result.getScore());
            application.setExplanation(result.getExplanation());
            application.setImprovementSuggestions(result.getImprovementSuggestions().isEmpty()
                    ? null
                    : String.join(" | ", result.getImprovementSuggestions()));
            application.setExceptionFlag(result.isExceptionFlag());
        } catch (RuntimeException exception) {
            application.setAilsScore(null);
            application.setExplanation("AILS scoring could not be generated at apply time.");
            application.setImprovementSuggestions(null);
            application.setExceptionFlag(false);
        }
    }

    @Transactional
    public MessageResponse setRemark(Long applicationId, String remark) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Application not found"));
        application.setRemarksByOfficer(remark);
        applicationRepository.save(application);
        return new MessageResponse("Remark saved successfully");
    }

    @Transactional
    public MessageResponse setRemarkForOfficer(Long officerId, Long applicationId, String remark) {
        Application application = getAccessibleApplicationForOfficer(officerId, applicationId);
        application.setRemarksByOfficer(remark);
        applicationRepository.save(application);
        return new MessageResponse("Remark saved successfully");
    }

    private Application getAccessibleApplicationForOfficer(Long officerId, Long applicationId) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Application not found"));
        validateOfficerAccessToJob(officerId, application.getJob().getId());
        return application;
    }

    private void validateOfficerAccessToJob(Long officerId, Long jobId) {
        PlacementOfficer officer = placementOfficerRepository.findById(officerId)
                .orElseThrow(() -> new RuntimeException("Officer not found"));
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));

        boolean assignedToJob = job.getAssignedOfficers().stream()
                .anyMatch(assignedOfficer -> assignedOfficer.getId().equals(officerId));

        if (!officer.isApproved() || !officer.isActive()) {
            throw new RuntimeException("Officer account is not active.");
        }
        if (!job.getCompany().getId().equals(officer.getCompany().getId()) || !assignedToJob) {
            throw new RuntimeException("Unauthorized access to this job.");
        }
    }
}
