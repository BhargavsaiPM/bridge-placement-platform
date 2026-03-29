package com.bridge.placement.service;

import com.bridge.placement.dto.request.UpdateOfficerProfileRequest;
import com.bridge.placement.entity.PlacementOfficer;
import com.bridge.placement.repository.PlacementOfficerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
public class OfficerService {
    private final PlacementOfficerRepository officerRepository;
    private final PasswordEncoder passwordEncoder;

    public PlacementOfficer getOfficerProfile(Long officerId) {
        return officerRepository.findById(officerId)
                .orElseThrow(() -> new RuntimeException("Officer not found"));
    }

    @Transactional
    public PlacementOfficer updateOfficerProfile(Long officerId, UpdateOfficerProfileRequest request) {
        PlacementOfficer officer = officerRepository.findById(officerId)
                .orElseThrow(() -> new RuntimeException("Officer not found"));

        officer.setName(request.getName());
        officer.setAge(request.getAge());
        officer.setDateOfBirth(request.getDateOfBirth());
        officer.setMobileNumber(request.getMobileNumber());
        officer.setJobRole(request.getJobRole());
        officer.setDepartment(request.getDepartment());
        officer.setBloodGroup(request.getBloodGroup());
        officer.setDoorNumber(request.getDoorNumber());
        officer.setStreetName(request.getStreetName());
        officer.setLandmark(request.getLandmark());
        officer.setCity(request.getCity());
        officer.setDistrict(request.getDistrict());
        officer.setState(request.getState());
        officer.setPincode(request.getPincode());
        officer.setCountry(request.getCountry());

        if (request.getProfilePhoto() != null && !request.getProfilePhoto().isBlank()) {
            officer.setProfilePhoto(request.getProfilePhoto());
        }

        String fullAddress = Stream.of(
                request.getDoorNumber(), request.getStreetName(), request.getLandmark(),
                request.getCity(), request.getDistrict(), request.getState(), request.getPincode(), request.getCountry())
                .filter(s -> s != null && !s.isBlank()).collect(Collectors.joining(", "));

        officer.setAddress(fullAddress);

        return officerRepository.save(officer);
    }

    @Transactional
    public void changePassword(Long officerId, String newPassword) {
        PlacementOfficer officer = officerRepository.findById(officerId)
                .orElseThrow(() -> new RuntimeException("Officer not found"));

        if (!officer.isRequiresPasswordChange()) {
            throw new RuntimeException("Password has already been set. Contact your company admin to reset it.");
        }

        officer.setPassword(passwordEncoder.encode(newPassword));
        officer.setRequiresPasswordChange(false);
        officerRepository.save(officer);
    }

    @Transactional
    public void resetOfficerPassword(Long companyId, Long officerId, String newTemporaryPassword) {
        PlacementOfficer officer = officerRepository.findById(officerId)
                .orElseThrow(() -> new RuntimeException("Officer not found"));

        if (!officer.getCompany().getId().equals(companyId)) {
            throw new RuntimeException("Unauthorized: officer does not belong to your company");
        }

        officer.setPassword(passwordEncoder.encode(newTemporaryPassword));
        officer.setRequiresPasswordChange(true);
        officerRepository.save(officer);
    }
}
