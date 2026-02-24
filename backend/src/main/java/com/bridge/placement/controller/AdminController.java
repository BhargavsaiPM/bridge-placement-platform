package com.bridge.placement.controller;

import com.bridge.placement.entity.Application;
import com.bridge.placement.entity.Company;
import com.bridge.placement.entity.User;
import com.bridge.placement.enums.ApplicationStatus;
import com.bridge.placement.enums.JobStatus;
import com.bridge.placement.repository.ApplicationRepository;
import com.bridge.placement.repository.CompanyRepository;
import com.bridge.placement.repository.JobRepository;
import com.bridge.placement.repository.UserRepository;
import com.bridge.placement.repository.AdminRepository;
import com.bridge.placement.repository.PlacementOfficerRepository;
import com.bridge.placement.security.services.BridgeUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
public class AdminController {

    private final UserRepository userRepository;
    private final CompanyRepository companyRepository;
    private final JobRepository jobRepository;
    private final AdminRepository adminRepository;
    private final ApplicationRepository applicationRepository;
    private final PlacementOfficerRepository placementOfficerRepository;
    private final PasswordEncoder passwordEncoder;

    // ==================== Dashboard Stats ====================
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", userRepository.count());
        stats.put("activeCompanies", companyRepository.countByApproved(true));
        stats.put("activeJobs", jobRepository.countByStatus(JobStatus.OPEN));
        stats.put("pendingApprovals", companyRepository.countByApproved(false));
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
        long selected = allApps.stream().filter(a -> a.getApplicationStatus() == ApplicationStatus.SELECTED).count();
        long rejected = allApps.stream().filter(a -> a.getApplicationStatus() == ApplicationStatus.REJECTED).count();

        return ResponseEntity.ok(List.of(
                Map.of("name", "Applied", "value", applied),
                Map.of("name", "Shortlisted", "value", shortlisted),
                Map.of("name", "Interview", "value", interview),
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

    // ==================== Activity ====================
    @GetMapping("/active-users")
    public ResponseEntity<List<Map<String, Object>>> getActiveUsers() {
        List<Map<String, Object>> users = new ArrayList<>();
        userRepository.findAll().forEach(u -> {
            Map<String, Object> entry = new HashMap<>();
            entry.put("id", u.getId());
            entry.put("name", u.getName());
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
    public ResponseEntity<List<Map<String, Object>>> getLoginLogs() {
        // No login tracking table exists yet — return empty
        return ResponseEntity.ok(List.of());
    }

    @GetMapping("/server-load")
    public ResponseEntity<Map<String, Object>> getServerLoad() {
        Runtime runtime = Runtime.getRuntime();
        long totalMem = runtime.totalMemory();
        long freeMem = runtime.freeMemory();
        int cpuPercent = (int) ((totalMem - freeMem) * 100 / totalMem);
        return ResponseEntity.ok(Map.of(
                "cpu", cpuPercent,
                "memory", (totalMem - freeMem) / (1024 * 1024) + " MB",
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
    public ResponseEntity<List<Map<String, Object>>> getStudentProgress() {
        List<Application> allApps = applicationRepository.findAll();
        List<Map<String, Object>> result = allApps.stream().map(app -> {
            Map<String, Object> entry = new HashMap<>();
            entry.put("id", app.getId());
            entry.put("name", app.getUser() != null ? app.getUser().getName() : "Unknown");
            entry.put("email", app.getUser() != null ? app.getUser().getEmail() : "");
            entry.put("job", app.getJob() != null ? app.getJob().getTitle() : "Unknown");
            entry.put("status", app.getApplicationStatus().name());
            entry.put("score", app.getAilsScore());
            return entry;
        }).collect(Collectors.toList());
        return ResponseEntity.ok(result);
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
