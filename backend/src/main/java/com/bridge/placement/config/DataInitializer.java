package com.bridge.placement.config;

import com.bridge.placement.entity.Admin;
import com.bridge.placement.enums.Role;
import com.bridge.placement.repository.AdminRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        seedSuperAdmin();
    }

    private void seedSuperAdmin() {
        String adminEmail = "admin@bridge.com";

        if (adminRepository.existsByEmail(adminEmail)) {
            log.info("✅ Super Admin already exists — skipping seed.");
            return;
        }

        Admin admin = new Admin();
        admin.setEmail(adminEmail);
        admin.setName("Bridge Admin");
        admin.setPassword(passwordEncoder.encode("admin123"));
        admin.setRole(Role.SUPER_ADMIN);

        adminRepository.save(admin);
        log.info("🚀 Super Admin created → email: {} | password: admin123", adminEmail);
    }
}
