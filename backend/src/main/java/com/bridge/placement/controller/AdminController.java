package com.bridge.placement.controller;

import com.bridge.placement.entity.Application;
import com.bridge.placement.entity.Company;
import com.bridge.placement.entity.LoginLog;
import com.bridge.placement.entity.User;
import com.bridge.placement.enums.ApplicationStatus;
import com.bridge.placement.enums.JobStatus;
import com.bridge.placement.repository.ApplicationRepository;
import com.bridge.placement.repository.CompanyRepository;
import com.bridge.placement.repository.JobRepository;
import com.bridge.placement.repository.LoginLogRepository;
import com.bridge.placement.repository.UserRepository;
import com.bridge.placement.repository.AdminRepository;
import com.bridge.placement.repository.PlacementOfficerRepository;
import com.bridge.placement.security.services.BridgeUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import java.lang.management.ManagementFactory;
import java.lang.management.OperatingSystemMXBean;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('SUPER_ADMIN')") // B29 fix: class-level authorization
public class AdminController {

    private final UserRepository userRepository;
    private final CompanyRepository companyRepository;
    private final JobRepository jobRepository;
    private final AdminRepository adminRepository;
    private final ApplicationRepository applicationRepository;
    private final PlacementOfficerRepository placementOfficerRepository;
    private final PasswordEncoder passwordEncoder;
    private final LoginLogRepository loginLogRepository; // N5/B25 fix

    // ==================== Admin Profile ====================
    @GetMapping("/profile")
    public ResponseEntity<Map<String, Object>> getProfile(@AuthenticationPrincipal BridgeUserDetails userDetails) {
        Optional<com.bridge.placement.entity.Admin> adminOpt = adminRepository.findById(userDetails.getId());
        if (adminOpt.isPresent()) {
            com.bridge.placement.entity.Admin admin = adminOpt.get();
            return ResponseEntity.ok(Map.of(
                "name", admin.getName(),
                "email", admin.getEmail(),
                "profilePhoto", admin.getProfilePhoto() != null ? admin.getProfilePhoto() : "",
                "roleType", admin.getRole().name()
            ));
        }
        return ResponseEntity.notFound().build();
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@RequestBody Map<String, String> body, @AuthenticationPrincipal BridgeUserDetails userDetails) {
        Optional<com.bridge.placement.entity.Admin> adminOpt = adminRepository.findById(userDetails.getId());
        if (adminOpt.isPresent()) {
            com.bridge.placement.entity.Admin admin = adminOpt.get();
            if (body.containsKey("name")) admin.setName(body.get("name"));
            if (body.containsKey("profilePhoto")) admin.setProfilePhoto(body.get("profilePhoto"));
            adminRepository.save(admin);
            return ResponseEntity.ok(Map.of("message", "Profile updated successfully"));
        }
        return ResponseEntity.notFound().build();
    }

    // ==================== Dashboard Stats ====================
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", userRepository.count());
        stats.put("activeCompanies", companyRepository.countByApproved(true));
        stats.put("activeJobs", jobRepository.countByStatus(JobStatus.OPEN));
        stats.put("pendingApprovals",
                companyRepository.countByApproved(false)
                        + userRepository.countByApproved(false)
                        + placementOfficerRepository.countByApprovedFalseAndActiveTrue());
        return ResponseEntity.ok(stats);
    }

    // ==================== Company Approvals ====================
    @GetMapping("/companies/pending")
    public ResponseEntity<List<Company>> getPendingCompanies() {
        return ResponseEntity.ok(companyRepository.findByApproved(false));
    }

    @PostMapping("/company/{id}/approve")
    public ResponseEntity<?> approveCompany(@PathVariable Long id) {
        Optional<Company> companyOpt = companyRepository.findById(id);
        if (companyOpt.isPresent()) {
            Company company = companyOpt.get();
            company.setApproved(true);
            company.setBlocked(false);
            companyRepository.save(company);
            return ResponseEntity.ok(Map.of("message", "Company approved successfully"));
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping("/company/{id}/reject")
    public ResponseEntity<?> rejectCompany(@PathVariable Long id) {
        Optional<Company> companyOpt = companyRepository.findById(id);
        if (companyOpt.isPresent()) {
            companyRepository.delete(companyOpt.get());
            return ResponseEntity.ok(Map.of("message", "Company rejected"));
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping("/company/{id}/block")
    public ResponseEntity<?> blockCompany(@PathVariable Long id) {
        Optional<Company> companyOpt = companyRepository.findById(id);
        if (companyOpt.isPresent()) {
            Company company = companyOpt.get();
            company.setApproved(false);
            company.setBlocked(true);
            companyRepository.save(company);
            return ResponseEntity.ok(Map.of("message", "Company blocked"));
        }
        return ResponseEntity.notFound().build();
    }

    // ==================== Password Verification ====================
    @PostMapping("/verify-password")
    public ResponseEntity<Map<String, Object>> verifyPassword(
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal BridgeUserDetails userDetails) {
        String password = body.get("password");
        if (password == null) {
            return ResponseEntity.badRequest().body(Map.of("valid", false, "message", "Password is required"));
        }
        var admin = adminRepository.findById(userDetails.getId());
        if (admin.isPresent() && passwordEncoder.matches(password, admin.get().getPassword())) {
            return ResponseEntity.ok(Map.of("valid", true));
        }
        return ResponseEntity.ok(Map.of("valid", false, "message", "Invalid password"));
    }

    // ==================== Analytics ====================
    @GetMapping("/placement-stats")
    public ResponseEntity<List<Map<String, Object>>> getPlacementStats() {
        // Return monthly placement data from applications
        List<Application> allApps = applicationRepository.findAll();
        Map<String, Long> monthlyCounts = allApps.stream()
                .filter(a -> a.getAppliedAt() != null)
                .collect(Collectors.groupingBy(
                        a -> a.getAppliedAt().getMonth().toString().substring(0, 3),
                        Collectors.counting()));

        String[] months = { "JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC" };
        List<Map<String, Object>> result = new ArrayList<>();
        for (String m : months) {
            result.add(Map.of("name", m, "value", monthlyCounts.getOrDefault(m, 0L)));
        }
        return ResponseEntity.ok(result);
    }

    @GetMapping("/student-performance")
    public ResponseEntity<List<Map<String, Object>>> getStudentPerformance() {
        List<Application> allApps = applicationRepository.findAll();
        long applied = allApps.stream().filter(a -> a.getApplicationStatus() == ApplicationStatus.APPLIED).count();
        long shortlisted = allApps.stream().filter(a -> a.getApplicationStatus() == ApplicationStatus.SHORTLISTED)
                .count();
        long interview = allApps.stream().filter(a -> a.getApplicationStatus() == ApplicationStatus.INTERVIEW).count();
        long technicalRound = allApps.stream().filter(a -> a.getApplicationStatus() == ApplicationStatus.TECHNICAL_ROUND).count();
        long selected = allApps.stream().filter(a -> a.getApplicationStatus() == ApplicationStatus.SELECTED).count();
        long rejected = allApps.stream().filter(a -> a.getApplicationStatus() == ApplicationStatus.REJECTED).count();

        return ResponseEntity.ok(List.of(
                Map.of("name", "Applied", "value", applied),
                Map.of("name", "Shortlisted", "value", shortlisted),
                Map.of("name", "Interview", "value", interview),
                Map.of("name", "Technical Round", "value", technicalRound),
                Map.of("name", "Selected", "value", selected),
                Map.of("name", "Rejected", "value", rejected)));
    }

    @GetMapping("/recruiter-engagement")
    public ResponseEntity<List<Map<String, Object>>> getRecruiterEngagement() {
        long totalCompanies = companyRepository.count();
        long approvedCompanies = companyRepository.countByApproved(true);
        long pendingCompanies = companyRepository.countByApproved(false);
        long totalJobs = jobRepository.count();
        long officers = placementOfficerRepository.count();

        return ResponseEntity.ok(List.of(
                Map.of("name", "Companies", "value", totalCompanies),
                Map.of("name", "Approved", "value", approvedCompanies),
                Map.of("name", "Pending", "value", pendingCompanies),
                Map.of("name", "Jobs Posted", "value", totalJobs),
                Map.of("name", "Officers", "value", officers)));
    }

    // ==================== User Approvals ====================
    @GetMapping("/users/pending")
    public ResponseEntity<List<User>> getPendingUsers(@RequestParam String type) {
        try {
            com.bridge.placement.enums.UserType roleType = com.bridge.placement.enums.UserType
                    .valueOf(type.toUpperCase());
            return ResponseEntity.ok(userRepository.findByApprovedFalseAndBlockedFalseAndRoleType(roleType));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/officers/pending")
    public ResponseEntity<List<com.bridge.placement.entity.PlacementOfficer>> getPendingOfficers() {
        return ResponseEntity.ok(placementOfficerRepository.findByApprovedFalseAndActiveTrue());
    }

    @PostMapping("/officer/{id}/approve")
    public ResponseEntity<?> approveOfficer(@PathVariable Long id) {
        Optional<com.bridge.placement.entity.PlacementOfficer> officerOpt = placementOfficerRepository.findById(id);
        if (officerOpt.isPresent()) {
            com.bridge.placement.entity.PlacementOfficer officer = officerOpt.get();
            officer.setApproved(true);
            officer.setActive(true);
            placementOfficerRepository.save(officer);
            return ResponseEntity.ok(Map.of("message", "Officer approved successfully"));
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping("/officer/{id}/reject")
    public ResponseEntity<?> rejectOfficer(@PathVariable Long id) {
        Optional<com.bridge.placement.entity.PlacementOfficer> officerOpt = placementOfficerRepository.findById(id);
        if (officerOpt.isPresent()) {
            placementOfficerRepository.delete(officerOpt.get());
            return ResponseEntity.ok(Map.of("message", "Officer rejected"));
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping("/officer/{id}/block")
    public ResponseEntity<?> blockOfficer(@PathVariable Long id) {
        Optional<com.bridge.placement.entity.PlacementOfficer> officerOpt = placementOfficerRepository.findById(id);
        if (officerOpt.isPresent()) {
            com.bridge.placement.entity.PlacementOfficer officer = officerOpt.get();
            officer.setApproved(false);
            officer.setActive(false);
            placementOfficerRepository.save(officer);
            return ResponseEntity.ok(Map.of("message", "Officer blocked"));
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping("/user/{id}/approve")
    public ResponseEntity<?> approveUser(@PathVariable Long id) {
        Optional<User> userOpt = userRepository.findById(id);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            user.setApproved(true);
            user.setBlocked(false);
            userRepository.save(user);
            return ResponseEntity.ok(Map.of("message", "User approved successfully"));
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping("/user/{id}/reject")
    public ResponseEntity<?> rejectUser(@PathVariable Long id) {
        Optional<User> userOpt = userRepository.findById(id);
        if (userOpt.isPresent()) {
            userRepository.delete(userOpt.get());
            return ResponseEntity.ok(Map.of("message", "User rejected and deleted"));
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping("/user/{id}/block")
    public ResponseEntity<?> blockUser(@PathVariable Long id) {
        Optional<User> userOpt = userRepository.findById(id);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            user.setBlocked(true);
            user.setApproved(false);
            userRepository.save(user);
            return ResponseEntity.ok(Map.of("message", "User blocked"));
        }
        return ResponseEntity.notFound().build();
    }

    // ==================== Data Management Lists (Analytics) ====================
    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    @GetMapping("/companies")
    public ResponseEntity<List<Company>> getAllCompanies() {
        return ResponseEntity.ok(companyRepository.findAll());
    }

    @GetMapping("/jobs")
    public ResponseEntity<List<com.bridge.placement.entity.Job>> getAllJobs() {
        return ResponseEntity.ok(jobRepository.findAll());
    }

    @PostMapping("/job/{id}/block")
    public ResponseEntity<?> blockJob(@PathVariable Long id) {
        Optional<com.bridge.placement.entity.Job> jobOpt = jobRepository.findById(id);
        if (jobOpt.isPresent()) {
            com.bridge.placement.entity.Job job = jobOpt.get();
            job.setBlockedByAdmin(true);
            job.setStatus(JobStatus.CLOSED);
            jobRepository.save(job);
            return ResponseEntity.ok(Map.of("message", "Job closed by admin"));
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping("/job/{id}/unblock")
    public ResponseEntity<?> unblockJob(@PathVariable Long id) {
        Optional<com.bridge.placement.entity.Job> jobOpt = jobRepository.findById(id);
        if (jobOpt.isPresent()) {
            com.bridge.placement.entity.Job job = jobOpt.get();
            job.setBlockedByAdmin(false);
            job.setStatus(JobStatus.OPEN);
            jobRepository.save(job);
            return ResponseEntity.ok(Map.of("message", "Job reopened successfully"));
        }
        return ResponseEntity.notFound().build();
    }

    // ==================== Activity ====================
    @GetMapping("/active-users")
    public ResponseEntity<List<Map<String, Object>>> getActiveUsers() {
        List<Map<String, Object>> users = new ArrayList<>();
        userRepository.findAll().forEach(u -> {
            Map<String, Object> entry = new HashMap<>();
            entry.put("id", u.getId());
            entry.put("name", u.getFullName());
            entry.put("email", u.getEmail());
            entry.put("type", "user");
            users.add(entry);
        });
        companyRepository.findAll().forEach(c -> {
            Map<String, Object> entry = new HashMap<>();
            entry.put("id", c.getId());
            entry.put("name", c.getName());
            entry.put("email", c.getDomainEmail());
            entry.put("type", "company");
            users.add(entry);
        });
        placementOfficerRepository.findAll().forEach(o -> {
            Map<String, Object> entry = new HashMap<>();
            entry.put("id", o.getId());
            entry.put("name", o.getName());
            entry.put("email", o.getEmail());
            entry.put("type", "officer");
            users.add(entry);
        });
        return ResponseEntity.ok(users);
    }

    @GetMapping("/login-logs")
    public ResponseEntity<List<LoginLog>> getLoginLogs() {
        // N5/B25 fix: Real login audit trail from DB
        return ResponseEntity.ok(loginLogRepository.findAllByOrderByLoginTimeDesc());
    }

    @GetMapping("/server-load")
    public ResponseEntity<Map<String, Object>> getServerLoad() {
        // B26 fix: Use OperatingSystemMXBean for real system load
        OperatingSystemMXBean osBean = ManagementFactory.getOperatingSystemMXBean();
        double systemLoad = osBean.getSystemLoadAverage(); // returns -1 if unavailable
        Runtime runtime = Runtime.getRuntime();
        long totalMem = runtime.totalMemory();
        long freeMem = runtime.freeMemory();
        long usedMemMB = (totalMem - freeMem) / (1024 * 1024);
        long totalMemMB = totalMem / (1024 * 1024);
        return ResponseEntity.ok(Map.of(
                "cpuLoad", systemLoad >= 0 ? String.format("%.1f%%", systemLoad * 100) : "N/A",
                "memoryUsedMB", usedMemMB,
                "memoryTotalMB", totalMemMB,
                "memoryUsagePercent", (int) ((double) usedMemMB / totalMemMB * 100),
                "uptime", "Running"));
    }

    // ==================== Delete Operations ====================
    @DeleteMapping("/user/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        if (userRepository.existsById(id)) {
            userRepository.deleteById(id);
            return ResponseEntity.ok(Map.of("message", "User deleted"));
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/company/{id}")
    public ResponseEntity<?> deleteCompany(@PathVariable Long id) {
        if (companyRepository.existsById(id)) {
            companyRepository.deleteById(id);
            return ResponseEntity.ok(Map.of("message", "Company deleted"));
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/job/{id}")
    public ResponseEntity<?> deleteJob(@PathVariable Long id) {
        if (jobRepository.existsById(id)) {
            jobRepository.deleteById(id);
            return ResponseEntity.ok(Map.of("message", "Job deleted"));
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/officer/{id}")
    public ResponseEntity<?> deleteOfficer(@PathVariable Long id) {
        if (placementOfficerRepository.existsById(id)) {
            placementOfficerRepository.deleteById(id);
            return ResponseEntity.ok(Map.of("message", "Officer deleted"));
        }
        return ResponseEntity.notFound().build();
    }

    // ==================== Kanban ====================
    @GetMapping("/student-progress")
    public ResponseEntity<Map<String, Object>> getStudentProgress(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        Pageable pageable = PageRequest.of(page, size);
        Page<Application> appPage = applicationRepository.findAll(pageable);
        
        List<Map<String, Object>> result = appPage.getContent().stream().map(app -> {
            Map<String, Object> entry = new HashMap<>();
            entry.put("id", app.getId());
            entry.put("name", app.getUser() != null ? app.getUser().getFullName() : "Unknown");
            entry.put("email", app.getUser() != null ? app.getUser().getEmail() : "");
            entry.put("job", app.getJob() != null ? app.getJob().getTitle() : "Unknown");
            entry.put("status", app.getApplicationStatus().name());
            entry.put("score", app.getAilsScore());
            return entry;
        }).collect(Collectors.toList());
        
        Map<String, Object> response = new HashMap<>();
        response.put("applications", result);
        response.put("currentPage", appPage.getNumber());
        response.put("totalItems", appPage.getTotalElements());
        response.put("totalPages", appPage.getTotalPages());
        
        return ResponseEntity.ok(response);
    }

    @PutMapping("/student-progress/{id}")
    public ResponseEntity<?> updateStudentProgress(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String status = body.get("status");
        if (status == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Status is required"));
        }
        Optional<Application> appOpt = applicationRepository.findById(id);
        if (appOpt.isPresent()) {
            Application app = appOpt.get();
            app.setApplicationStatus(ApplicationStatus.valueOf(status));
            applicationRepository.save(app);
            return ResponseEntity.ok(Map.of("message", "Progress updated"));
        }
        return ResponseEntity.notFound().build();
    }
}
