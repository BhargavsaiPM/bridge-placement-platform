package com.bridge.placement.service;

import com.bridge.placement.dto.request.LoginRequest;
import com.bridge.placement.dto.request.RegisterCompanyRequest;
import com.bridge.placement.dto.request.RegisterUserRequest;
import com.bridge.placement.dto.response.AuthResponse;
import com.bridge.placement.dto.response.MessageResponse;
import com.bridge.placement.entity.Company;
import com.bridge.placement.entity.LoginLog;
import com.bridge.placement.entity.OtpToken;
import com.bridge.placement.entity.PlacementOfficer;
import com.bridge.placement.entity.User;
import com.bridge.placement.enums.Role;
import com.bridge.placement.repository.CompanyRepository;
import com.bridge.placement.repository.LoginLogRepository;
import com.bridge.placement.repository.OtpTokenRepository;
import com.bridge.placement.repository.PlacementOfficerRepository;
import com.bridge.placement.repository.UserRepository;
import com.bridge.placement.security.jwt.JwtUtils;
import com.bridge.placement.security.services.BridgeUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;

import jakarta.servlet.http.HttpServletRequest;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final CompanyRepository companyRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;
    private final JavaMailSender mailSender;
    private final OtpTokenRepository otpTokenRepository;  // B1/B2 fix
    private final LoginLogRepository loginLogRepository;   // N5 fix
    private final PlacementOfficerRepository placementOfficerRepository;

    // B38: Simple in-memory rate limiting
    private final Map<String, Integer> loginAttempts = new ConcurrentHashMap<>();
    private final Map<String, LocalDateTime> lockTime = new ConcurrentHashMap<>();
    private static final int MAX_ATTEMPT = 5;
    private static final int LOCK_DURATION_MINUTES = 15;

    public AuthResponse authenticateUser(LoginRequest loginRequest) {
        String email = loginRequest.getEmail();

        if (lockTime.containsKey(email)) {
            if (lockTime.get(email).plusMinutes(LOCK_DURATION_MINUTES).isAfter(LocalDateTime.now())) {
                throw new RuntimeException("Account locker: Too many failed attempts. Try again in 15 minutes.");
            } else {
                lockTime.remove(email);
                loginAttempts.remove(email);
            }
        }

        // B40: Specific Block checks per explicit user request
        userRepository.findByEmail(email).ifPresent(user -> {
            if (user.isBlocked()) {
                throw new RuntimeException("Your account has been blocked by admin");
            }
        });

        companyRepository.findByDomainEmail(email).ifPresent(company -> {
            if (company.isBlocked()) {
                throw new RuntimeException("Your account has been blocked by admin");
            }
        });

        placementOfficerRepository.findByEmail(email).ifPresent(officer -> {
            if (!officer.isActive()) {
                throw new RuntimeException("Your officer account has been deactivated.");
            }
            if (!officer.isApproved()) {
                throw new RuntimeException("Your officer account is awaiting admin approval.");
            }
        });

        Authentication authentication;
        try {
            authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(email, loginRequest.getPassword()));
        } catch (Exception e) {
            int attempts = loginAttempts.getOrDefault(email, 0) + 1;
            if (attempts >= MAX_ATTEMPT) {
                lockTime.put(email, LocalDateTime.now());
                throw new RuntimeException("Account locker: Too many failed attempts. Try again in 15 minutes.");
            }
            loginAttempts.put(email, attempts);
            throw e; // rethrow the original exception (e.g., BadCredentialsException)
        }

        // Reset on successful login
        loginAttempts.remove(email);
        lockTime.remove(email);

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        BridgeUserDetails userDetails = (BridgeUserDetails) authentication.getPrincipal();
        List<String> roles = userDetails.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toList());

        // N5 fix: Log every successful login
        String role = roles.isEmpty() ? "UNKNOWN" : roles.get(0);
        loginLogRepository.save(new LoginLog(userDetails.getEmail(), role, "via-app"));

        return new AuthResponse(jwt,
                userDetails.getId(),
                userDetails.getUsername(),
                userDetails.getEmail(),
                roles);
    }

    @Transactional
    public MessageResponse registerUser(RegisterUserRequest req) {
        if (userRepository.existsByEmail(req.getEmail())) {
            return new MessageResponse("Error: Email is already in use!");
        }

        User user = new User();

        // Name
        user.setFirstName(req.getFirstName());
        user.setMiddleName(req.getMiddleName());
        user.setLastName(req.getLastName());

        // Auth
        user.setEmail(req.getEmail());
        user.setPassword(passwordEncoder.encode(req.getPassword()));
        user.setMobile(req.getMobile());
        user.setDob(req.getDob());
        user.setRoleType(req.getRoleType());
        user.setRole(Role.USER);

        // Student-specific fields
        user.setCollegeRollNumber(req.getCollegeRollNumber());
        user.setCollegeMailId(req.getCollegeMailId());
        user.setCollegeName(req.getCollegeName());
        user.setCollegeCity(req.getCollegeCity());
        user.setCollegeDistrict(req.getCollegeDistrict());
        user.setCollegeCountry(req.getCollegeCountry());
        user.setCollegePincode(req.getCollegePincode());
        user.setStudentIdCardUrl(req.getStudentIdCardUrl());

        // Professional-specific fields
        user.setEmployeeId(req.getEmployeeId());
        user.setCompanyMailId(req.getCompanyMailId());
        user.setCompanyName(req.getCompanyName());
        user.setCompanyCity(req.getCompanyCity());
        user.setCompanyDistrict(req.getCompanyDistrict());
        user.setCompanyCountry(req.getCompanyCountry());
        user.setCompanyPincode(req.getCompanyPincode());
        user.setCurrentPosition(req.getCurrentPosition());
        user.setEmployeeIdCardUrl(req.getEmployeeIdCardUrl());

        // Personal address
        user.setCountry(req.getCountry());
        user.setState(req.getState());
        user.setDistrict(req.getDistrict());
        user.setPincode(req.getPincode());
        user.setCity(req.getCity());
        user.setStreet(req.getStreet());
        user.setDoorNumber(req.getDoorNumber());

        // Extras
        user.setGithubLink(req.getGithubLink());
        user.setResumeUrl(req.getResumeFileName());
        user.setSkills(req.getSkills());
        user.setAchievements(req.getAchievements());
        user.setProfilePhoto(req.getProfilePhoto());
        user.setHighestQualification(req.getHighestQualification());
        user.setCgpa(req.getCgpa());
        user.setSpecialization(req.getSpecialization());
        user.setPassingYear(req.getPassingYear());
        user.setExperienceYears(req.getExperienceYears());

        // Approval - requires admin approval
        user.setApproved(false);
        user.setBlocked(false);

        userRepository.save(user);

        return new MessageResponse("Registration submitted successfully! Please wait for Admin approval.");
    }

    @Transactional
    public MessageResponse registerCompany(RegisterCompanyRequest signUpRequest) {
        if (companyRepository.existsByDomainEmail(signUpRequest.getDomainEmail())) {
            return new MessageResponse("Error: Email is already in use!");
        }

        Company company = new Company();
        company.setName(signUpRequest.getName());
        company.setDomainEmail(signUpRequest.getDomainEmail());
        company.setPassword(passwordEncoder.encode(signUpRequest.getPassword()));
        String fullAddress = java.util.stream.Stream.of(
                signUpRequest.getDoorNumber(),
                signUpRequest.getStreetName(),
                signUpRequest.getLandmark(),
                signUpRequest.getCity(),
                signUpRequest.getState(),
                signUpRequest.getPincode(),
                signUpRequest.getCountry()).filter(s -> s != null && !s.isBlank())
                .collect(java.util.stream.Collectors.joining(", "));

        company.setBranchAddress(fullAddress);
        company.setCompanyType(signUpRequest.getCompanyType());
        if (signUpRequest.getIndustrySector() != null) {
            company.setIndustrySector(signUpRequest.getIndustrySector());
        }
        company.setProofDocumentUrl(signUpRequest.getProofDocumentUrl());
        company.setRole(Role.COMPANY);
        company.setApproved(false);

        companyRepository.save(company);

        return new MessageResponse("Company registered successfully! Wait for Admin approval.");
    }

    // --- Forgot / Reset Password Logic ---

    public MessageResponse forgotPassword(String email) {
        boolean existsUser = userRepository.existsByEmail(email);
        boolean existsCompany = companyRepository.existsByDomainEmail(email);

        if (!existsUser && !existsCompany) {
            return new MessageResponse("If your email is registered, an OTP has been sent.");
        }

        String otp = String.valueOf((int) (Math.random() * 900000) + 100000);

        // B1 fix: Store OTP in DB instead of in-memory Map
        otpTokenRepository.deleteByEmail(email); // clear any old OTPs
        otpTokenRepository.save(new OtpToken(email, otp));

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(email);
            message.setSubject("Bridge Placement: Password Reset OTP");
            message.setText("Your OTP for password recovery is: " + otp + "\n\nThis OTP expires in 10 minutes. Do not share it with anyone.");
            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("Email sending failed: " + e.getMessage());
        }

        System.out.println("==========================================");
        System.out.println("🔐 FORGOT PASSWORD OTP for " + email + ": " + otp);
        System.out.println("==========================================");

        return new MessageResponse("OTP sent successfully to " + email);
    }

    public MessageResponse resetPassword(String email, String otp, String newPassword) {
        // B1/B2 fix: Fetch OTP from DB with expiry check
        OtpToken storedToken = otpTokenRepository.findTopByEmailOrderByCreatedAtDesc(email)
                .orElseThrow(() -> new RuntimeException("Invalid or expired OTP"));

        // B2 fix: OTP expires after 10 minutes
        long minutesElapsed = ChronoUnit.MINUTES.between(storedToken.getCreatedAt(), LocalDateTime.now());
        if (minutesElapsed > 10) {
            otpTokenRepository.deleteByEmail(email);
            throw new RuntimeException("OTP has expired. Please request a new one.");
        }

        if (!storedToken.getOtp().equals(otp)) {
            throw new RuntimeException("Invalid OTP");
        }

        if (userRepository.existsByEmail(email)) {
            User user = userRepository.findByEmail(email).get();
            user.setPassword(passwordEncoder.encode(newPassword));
            userRepository.save(user);
        } else if (companyRepository.existsByDomainEmail(email)) {
            Company company = companyRepository.findByDomainEmail(email).get();
            company.setPassword(passwordEncoder.encode(newPassword));
            companyRepository.save(company);
        } else {
            throw new RuntimeException("User not found via email");
        }

        otpTokenRepository.deleteByEmail(email); // cleanup after successful reset

        return new MessageResponse("Password reset successfully! You can now login.");
    }
}

