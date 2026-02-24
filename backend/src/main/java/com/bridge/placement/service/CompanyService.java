package com.bridge.placement.service;

import com.bridge.placement.dto.request.PlacementOfficerRequest;
import com.bridge.placement.dto.response.MessageResponse;
import com.bridge.placement.entity.Company;
import com.bridge.placement.entity.PlacementOfficer;
import com.bridge.placement.enums.Role;
import com.bridge.placement.repository.CompanyRepository;
import com.bridge.placement.repository.PlacementOfficerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.bridge.placement.dto.request.UpdateCompanyProfileRequest;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CompanyService {

    private final CompanyRepository companyRepository;
    private final PlacementOfficerRepository placementOfficerRepository;
    private final PasswordEncoder passwordEncoder;

    public List<Company> getPendingCompanies() {
        return companyRepository.findAll();
    }

    public Company getCompanyById(Long id) {
        return companyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Company not found"));
    }

    @Transactional
    public MessageResponse approveCompany(Long companyId) {
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new RuntimeException("Company not found"));

        company.setApproved(true);
        companyRepository.save(company);
        return new MessageResponse("Company Approved Successfully");
    }

    @Transactional
    public MessageResponse rejectCompany(Long companyId) {
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new RuntimeException("Company not found"));

        companyRepository.delete(company);
        return new MessageResponse("Company Registration Rejected and Deleted");
    }

    @Transactional
    public MessageResponse createPlacementOfficer(Long companyId, PlacementOfficerRequest request) {
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new RuntimeException("Company not found"));

        if (!company.isApproved()) {
            throw new RuntimeException("Company is not approved yet!");
        }

        if (placementOfficerRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists for an officer");
        }

        PlacementOfficer officer = new PlacementOfficer();
        officer.setName(request.getName());
        officer.setEmail(request.getEmail());
        officer.setPassword(passwordEncoder.encode(request.getPassword()));
        officer.setAge(request.getAge());
        officer.setJobRole(request.getJobRole());
        officer.setWorkingSince(request.getWorkingSince());
        officer.setProfilePhoto(request.getProfilePhoto());
        officer.setDepartment(request.getDepartment());
        officer.setBloodGroup(request.getBloodGroup());

        String address = java.util.stream.Stream.of(
                request.getDoorNumber(),
                request.getStreetName(),
                request.getCity(),
                request.getState(),
                request.getPincode(),
                request.getCountry()).filter(s -> s != null && !s.isBlank())
                .collect(java.util.stream.Collectors.joining(", "));
        officer.setAddress(address);
        officer.setCompany(company);
        officer.setRole(Role.PLACEMENT_OFFICER);
        officer.setActive(true);

        placementOfficerRepository.save(officer);

        return new MessageResponse("Placement Officer Created Successfully");
    }

    @Transactional
    public Company updateCompanyProfile(Long companyId, UpdateCompanyProfileRequest request) {
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new RuntimeException("Company not found"));

        company.setName(request.getName());
        company.setBranchAddress(request.getBranchAddress());
        company.setCompanyType(request.getCompanyType());

        return companyRepository.save(company);
    }
}
