package com.bridge.placement.service;

import com.bridge.placement.dto.request.UpdateOfficerProfileRequest;
import com.bridge.placement.entity.PlacementOfficer;
import com.bridge.placement.repository.PlacementOfficerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
public class OfficerService {
    private final PlacementOfficerRepository officerRepository;

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
        officer.setJobRole(request.getJobRole());
        officer.setWorkingSince(request.getWorkingSince());
        officer.setDepartment(request.getDepartment());
        officer.setBloodGroup(request.getBloodGroup());

        if (request.getProfilePhoto() != null && !request.getProfilePhoto().isBlank()) {
            officer.setProfilePhoto(request.getProfilePhoto());
        }

        String fullAddress = Stream.of(
                request.getDoorNumber(), request.getStreetName(), request.getLandmark(),
                request.getCity(), request.getState(), request.getPincode(), request.getCountry())
                .filter(s -> s != null && !s.isBlank()).collect(Collectors.joining(", "));

        officer.setAddress(fullAddress);

        return officerRepository.save(officer);
    }
}
