package com.bridge.placement.service;

import com.bridge.placement.dto.request.LoginRequest;
import com.bridge.placement.dto.request.RegisterCompanyRequest;
import com.bridge.placement.dto.request.RegisterUserRequest;
import com.bridge.placement.dto.response.AuthResponse;
import com.bridge.placement.dto.response.MessageResponse;
import com.bridge.placement.entity.Company;
import com.bridge.placement.entity.User;
import com.bridge.placement.enums.Role;
import com.bridge.placement.repository.CompanyRepository;
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

import java.util.List;
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

    public AuthResponse authenticateUser(LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        BridgeUserDetails userDetails = (BridgeUserDetails) authentication.getPrincipal();
        List<String> roles = userDetails.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toList());

        return new AuthResponse(jwt,
                userDetails.getId(),
                userDetails.getUsername(),
                userDetails.getEmail(),
                roles);
    }

    @Transactional
    public MessageResponse registerUser(RegisterUserRequest signUpRequest) {
        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
            return new MessageResponse("Error: Email is already in use!");
        }

        User user = new User();
        user.setName(signUpRequest.getName());
        user.setEmail(signUpRequest.getEmail());
        user.setPassword(passwordEncoder.encode(signUpRequest.getPassword()));
        user.setRoleType(signUpRequest.getRoleType());
        user.setMobile(signUpRequest.getMobile());
        user.setDob(signUpRequest.getDob());
        user.setGithubLink(signUpRequest.getGithubLink());
        user.setResumeUrl(signUpRequest.getResumeFileName());
        user.setSkills(signUpRequest.getSkills());
        user.setAchievements(signUpRequest.getAchievements());
        user.setProfilePhoto(signUpRequest.getProfilePhoto());
        user.setRole(Role.USER);

        userRepository.save(user);

        return new MessageResponse("User registered successfully!");
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
        company.setRole(Role.COMPANY);
        company.setApproved(false); // Default false

        companyRepository.save(company);

        return new MessageResponse("Company registered successfully! Wait for Admin approval.");
    }

    // --- Forgot / Reset Password Logic ---

    // Simple in-memory OTP storage (Email -> OTP)
    // In production, use Redis or Database with expiration
    public static final java.util.Map<String, String> otpStorage = new java.util.concurrent.ConcurrentHashMap<>();

    public MessageResponse forgotPassword(String email) {
        // Check if email exists in User or Company
        boolean existsUser = userRepository.existsByEmail(email);
        boolean existsCompany = companyRepository.existsByDomainEmail(email);

        if (!existsUser && !existsCompany) {
            // For security, don't reveal if email exists or not, but for debugging/dev we
            // can be explicit if needed
            // Here we return success to prevent enumeration, but since this is a dev
            // project, we can just say sent.
            return new MessageResponse("If your email is registered, an OTP has been sent.");
        }

        // Generate 6 digit OTP
        String otp = String.valueOf((int) (Math.random() * 900000) + 100000);
        otpStorage.put(email, otp);

        // Try sending real email
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(email);
            message.setSubject("Bridge Placement: Password Reset OTP");
            message.setText("Your OTP for password recovery is: " + otp + "\n\nPlease do not share this with anyone.");
            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("Email sending failed due to config: " + e.getMessage());
        }

        // LOG OTP to Console (Mock Email Service / Backup for Dev)
        System.out.println("==========================================");
        System.out.println("🔐 FORGOT PASSWORD OTP for " + email + ": " + otp);
        System.out.println("==========================================");

        return new MessageResponse("OTP sent successfully to " + email);
    }

    public MessageResponse resetPassword(String email, String otp, String newPassword) {
        String storedOtp = otpStorage.get(email);

        if (storedOtp == null || !storedOtp.equals(otp)) {
            throw new RuntimeException("Invalid or expired OTP");
        }

        // Update Password
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

        // Clear OTP
        otpStorage.remove(email);

        return new MessageResponse("Password reset successfully! You can now login.");
    }
}
