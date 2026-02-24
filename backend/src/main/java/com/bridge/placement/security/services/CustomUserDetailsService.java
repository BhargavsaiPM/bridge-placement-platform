package com.bridge.placement.security.services;

import com.bridge.placement.entity.Admin;
import com.bridge.placement.entity.Company;
import com.bridge.placement.entity.PlacementOfficer;
import com.bridge.placement.entity.User;
import com.bridge.placement.repository.AdminRepository;
import com.bridge.placement.repository.CompanyRepository;
import com.bridge.placement.repository.PlacementOfficerRepository;
import com.bridge.placement.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;
    private final CompanyRepository companyRepository;
    private final PlacementOfficerRepository placementOfficerRepository;
    private final AdminRepository adminRepository;

    @Override
    @Transactional
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        // Check Admin
        Optional<Admin> admin = adminRepository.findByEmail(email);
        if (admin.isPresent()) {
            return BridgeUserDetails.build(admin.get());
        }

        // Check Job Seeker (User)
        Optional<User> user = userRepository.findByEmail(email);
        if (user.isPresent()) {
            return BridgeUserDetails.build(user.get());
        }

        // Check Company
        Optional<Company> company = companyRepository.findByDomainEmail(email);
        if (company.isPresent()) {
            return BridgeUserDetails.build(company.get());
        }

        // Check Placement Officer
        Optional<PlacementOfficer> officer = placementOfficerRepository.findByEmail(email);
        if (officer.isPresent()) {
            return BridgeUserDetails.build(officer.get());
        }

        throw new UsernameNotFoundException("User Not Found with email: " + email);
    }
}
