package com.bridge.placement.service;

import com.bridge.placement.dto.request.JobRequest;
import com.bridge.placement.entity.Company;
import com.bridge.placement.entity.Job;
import com.bridge.placement.entity.JobRound;
import com.bridge.placement.entity.PlacementOfficer;
import com.bridge.placement.enums.JobStatus;
import com.bridge.placement.enums.RoundName;
import com.bridge.placement.repository.ApplicationRepository;
import com.bridge.placement.repository.JobRepository;
import com.bridge.placement.repository.PlacementOfficerRepository;
import com.bridge.placement.repository.CompanyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class JobService {

    private final JobRepository jobRepository;
    private final PlacementOfficerRepository placementOfficerRepository;
    private final CompanyRepository companyRepository;
    private final NotificationService notificationService;
    private final ApplicationRepository applicationRepository;

    @Transactional
    public Job createJob(Long officerId, JobRequest request) {
        PlacementOfficer officer = placementOfficerRepository.findById(officerId)
                .orElseThrow(() -> new RuntimeException("Officer not found"));

        Company company = officer.getCompany(); // Job belongs to Company

        Job job = new Job();
        job.setTitle(request.getTitle());
        job.setDescription(request.getDescription());
        job.setMinimumQualifications(request.getMinimumQualifications());
        job.setPreferredQualifications(request.getPreferredQualifications());
        job.setCompany(company);
        job.setRequiredSkills(request.getRequiredSkills());
        job.setPreferredSkills(request.getPreferredSkills());
        job.setExperienceRequired(request.getExperienceRequired());
        job.setSalaryRange(request.getSalaryRange());
        job.setLocation(request.getLocation());
        job.setWorkMode(request.getWorkMode());
        job.setJobType(request.getJobType());
        job.setApplicationDeadline(request.getApplicationDeadline());
        job.setMaxApplicants(request.getMaxApplicants());
        job.setStatus(JobStatus.OPEN); // Default open for now
        job.setAssignedOfficers(resolveAssignedOfficers(company, request.getAssignedOfficerIds()));

        // Rounds
        if (request.getRounds() != null) {
            List<JobRound> rounds = new ArrayList<>();
            int order = 1;
            for (String roundNameStr : request.getRounds()) {
                JobRound round = new JobRound();
                round.setRoundName(RoundName.valueOf(roundNameStr));
                round.setRoundOrder(order++);
                round.setJob(job);
                rounds.add(round);
            }
            job.setRounds(rounds);
        }

        job = jobRepository.save(job);

        // Notify all users? Maybe too spammy. A real system would use a subscription
        // model.
        // For project, maybe just 1 notification to officer confirming
        notificationService.createNotification(officer.getEmail(), "Job Created",
                "Job " + job.getTitle() + " posted successfully.",
                com.bridge.placement.enums.NotificationType.JOB_POSTED);

        return job;
    }

    @Transactional
    public Job createJobByCompany(Long companyId, JobRequest request) {
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new RuntimeException("Company not found"));

        if (!company.isApproved()) {
            throw new RuntimeException("Company is not approved yet!");
        }

        Job job = new Job();
        job.setTitle(request.getTitle());
        job.setDescription(request.getDescription());
        job.setMinimumQualifications(request.getMinimumQualifications());
        job.setPreferredQualifications(request.getPreferredQualifications());
        job.setCompany(company);
        job.setRequiredSkills(request.getRequiredSkills());
        job.setPreferredSkills(request.getPreferredSkills());
        job.setExperienceRequired(request.getExperienceRequired());
        job.setSalaryRange(request.getSalaryRange());
        job.setLocation(request.getLocation());
        job.setWorkMode(request.getWorkMode());
        job.setJobType(request.getJobType());
        job.setApplicationDeadline(request.getApplicationDeadline());
        job.setMaxApplicants(request.getMaxApplicants());
        job.setStatus(JobStatus.OPEN); // Default open for now
        job.setAssignedOfficers(resolveAssignedOfficers(company, request.getAssignedOfficerIds()));

        // Rounds
        if (request.getRounds() != null) {
            List<JobRound> rounds = new ArrayList<>();
            int order = 1;
            for (String roundNameStr : request.getRounds()) {
                JobRound round = new JobRound();
                round.setRoundName(RoundName.valueOf(roundNameStr));
                round.setRoundOrder(order++);
                round.setJob(job);
                rounds.add(round);
            }
            job.setRounds(rounds);
        }

        job = jobRepository.save(job);

        notificationService.createNotification(company.getDomainEmail(), "Job Created",
                "Job " + job.getTitle() + " posted successfully by Admin.",
                com.bridge.placement.enums.NotificationType.JOB_POSTED);

        return job;
    }

    @Transactional(readOnly = true)
    public List<Job> searchJobs(String location, String type) {
        return jobRepository.findAll().stream()
                .filter(job -> location == null || job.getLocation() == null ||
                        job.getLocation().toLowerCase().contains(location.toLowerCase()))
                .filter(job -> type == null || job.getJobType() == null ||
                        job.getJobType().name().equalsIgnoreCase(type))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Job getJob(Long id) {
        return jobRepository.findById(id).orElseThrow(() -> new RuntimeException("Job not found"));
    }

    // Company Job Management
    @Transactional(readOnly = true)
    public List<Job> getJobsByCompany(Long companyId) {
        return jobRepository.findByCompanyId(companyId);
    }

    @Transactional
    public Job updateJobByCompany(Long companyId, Long jobId, JobRequest request) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));

        if (!job.getCompany().getId().equals(companyId)) {
            throw new RuntimeException("Unauthorized: Job does not belong to this company");
        }
        if (job.isBlockedByAdmin()) {
            throw new RuntimeException("Cannot modify this job as it has been closed by admin.");
        }

        updateJobFields(job, request);
        return jobRepository.save(job);
    }

    @Transactional
    public void closeJobByCompany(Long companyId, Long jobId) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));

        if (!job.getCompany().getId().equals(companyId)) {
            throw new RuntimeException("Unauthorized");
        }
        if (job.isBlockedByAdmin()) {
            throw new RuntimeException("Cannot modify this job as it has been closed by admin.");
        }

        job.setStatus(JobStatus.CLOSED);
        jobRepository.save(job);
    }

    // Officer Job Management
    @Transactional(readOnly = true)
    public List<Job> getJobsByOfficer(Long officerId) {
        PlacementOfficer officer = placementOfficerRepository.findById(officerId)
                .orElseThrow(() -> new RuntimeException("Officer not found"));
        return jobRepository.findVisibleJobsForOfficer(officer.getCompany().getId(), officerId);
    }

    @Transactional
    public Job updateJobByOfficer(Long officerId, Long jobId, JobRequest request) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));

        PlacementOfficer officer = placementOfficerRepository.findById(officerId)
                .orElseThrow(() -> new RuntimeException("Officer not found"));

        if (!job.getCompany().getId().equals(officer.getCompany().getId())) {
            throw new RuntimeException("Unauthorized: Job does not belong to your company");
        }
        if (job.isBlockedByAdmin()) {
            throw new RuntimeException("Cannot modify this job as it has been closed by admin.");
        }

        updateJobFields(job, request);
        return jobRepository.save(job);
    }

    @Transactional
    public void closeJobByOfficer(Long officerId, Long jobId) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));

        PlacementOfficer officer = placementOfficerRepository.findById(officerId)
                .orElseThrow(() -> new RuntimeException("Officer not found"));

        if (!job.getCompany().getId().equals(officer.getCompany().getId())) {
            throw new RuntimeException("Unauthorized");
        }
        if (job.isBlockedByAdmin()) {
            throw new RuntimeException("Cannot modify this job as it has been closed by admin.");
        }

        job.setStatus(JobStatus.CLOSED);
        jobRepository.save(job);
    }

    @Transactional
    public void deleteJobByCompany(Long companyId, Long jobId) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));

        if (!job.getCompany().getId().equals(companyId)) {
            throw new RuntimeException("Unauthorized: Job does not belong to this company");
        }

        long activeApplications = applicationRepository.countByJobId(jobId);
        if (activeApplications > 0) {
            throw new RuntimeException("Cannot delete job with existing applications. Close it instead.");
        }

        jobRepository.delete(job);
    }

    private void updateJobFields(Job job, JobRequest request) {
        job.setTitle(request.getTitle());
        job.setDescription(request.getDescription());
        job.setMinimumQualifications(request.getMinimumQualifications());
        job.setPreferredQualifications(request.getPreferredQualifications());
        job.setRequiredSkills(request.getRequiredSkills());
        job.setPreferredSkills(request.getPreferredSkills());
        job.setExperienceRequired(request.getExperienceRequired());
        job.setSalaryRange(request.getSalaryRange());
        job.setLocation(request.getLocation());
        job.setWorkMode(request.getWorkMode());
        job.setJobType(request.getJobType());
        job.setApplicationDeadline(request.getApplicationDeadline());
        job.setMaxApplicants(request.getMaxApplicants());
        job.setAssignedOfficers(resolveAssignedOfficers(job.getCompany(), request.getAssignedOfficerIds()));

        // Update rounds (B9 fix)
        if (request.getRounds() != null) {
            job.getRounds().clear();
            int order = 1;
            for (String roundNameStr : request.getRounds()) {
                JobRound round = new JobRound();
                round.setRoundName(RoundName.valueOf(roundNameStr));
                round.setRoundOrder(order++);
                round.setJob(job);
                job.getRounds().add(round);
            }
        }
    }

    private List<PlacementOfficer> resolveAssignedOfficers(Company company, List<Long> assignedOfficerIds) {
        if (assignedOfficerIds == null || assignedOfficerIds.isEmpty()) {
            return new ArrayList<>();
        }

        List<Long> uniqueOfficerIds = assignedOfficerIds.stream().distinct().toList();
        List<PlacementOfficer> officers = placementOfficerRepository.findAllById(uniqueOfficerIds);

        if (officers.size() != uniqueOfficerIds.size()) {
            throw new RuntimeException("One or more selected placement officers were not found.");
        }

        boolean invalidOfficer = officers.stream()
                .anyMatch(officer ->
                        !officer.getCompany().getId().equals(company.getId())
                                || !officer.isActive()
                                || !officer.isApproved());
        if (invalidOfficer) {
            throw new RuntimeException("Only active and admin-approved placement officers from your company can be assigned.");
        }

        return new ArrayList<>(officers);
    }
}
