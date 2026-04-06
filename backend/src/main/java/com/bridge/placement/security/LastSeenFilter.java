package com.bridge.placement.security;

import com.bridge.placement.entity.Company;
import com.bridge.placement.entity.PlacementOfficer;
import com.bridge.placement.entity.User;
import com.bridge.placement.repository.AdminRepository;
import com.bridge.placement.repository.CompanyRepository;
import com.bridge.placement.repository.PlacementOfficerRepository;
import com.bridge.placement.repository.UserRepository;
import com.bridge.placement.security.services.BridgeUserDetails;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.LocalDateTime;

/**
 * N4 fix: Intercepts authenticated requests and updates the lastSeen timestamp
 * for the currently logged-in User, Company, or Placement Officer.
 */
@Component
@RequiredArgsConstructor
public class LastSeenFilter extends OncePerRequestFilter {

    private final AdminRepository adminRepository;
    private final UserRepository userRepository;
    private final CompanyRepository companyRepository;
    private final PlacementOfficerRepository placementOfficerRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        if (auth != null && auth.isAuthenticated() && auth.getPrincipal() instanceof BridgeUserDetails userDetails) {
            String roleStr = auth.getAuthorities().stream().findFirst().map(a -> a.getAuthority()).orElse("");

            try {
                if (roleStr.equals("ROLE_USER")) {
                    userRepository.findById(userDetails.getId()).ifPresent(user -> {
                        user.setLastSeen(LocalDateTime.now());
                        userRepository.save(user);
                    });
                } else if (roleStr.equals("ROLE_SUPER_ADMIN")) {
                    adminRepository.findById(userDetails.getId()).ifPresent(admin -> {
                        admin.setLastSeen(LocalDateTime.now());
                        adminRepository.save(admin);
                    });
                } else if (roleStr.equals("ROLE_COMPANY")) {
                    companyRepository.findById(userDetails.getId()).ifPresent(company -> {
                        company.setLastSeen(LocalDateTime.now());
                        companyRepository.save(company);
                    });
                } else if (roleStr.equals("ROLE_PLACEMENT_OFFICER")) {
                    placementOfficerRepository.findById(userDetails.getId()).ifPresent(officer -> {
                        officer.setLastSeen(LocalDateTime.now());
                        placementOfficerRepository.save(officer);
                    });
                }
            } catch (Exception e) {
                // Fail silently — we don't want to break API calls just because a timestamp update failed
            }
        }

        filterChain.doFilter(request, response);
    }
}
