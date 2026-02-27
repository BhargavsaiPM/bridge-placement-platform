package com.bridge.placement.service;

import com.bridge.placement.dto.request.UpdateUserProfileRequest;
import com.bridge.placement.entity.User;
import com.bridge.placement.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;

    public User getUserProfile(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @Transactional
    public User updateUserProfile(Long userId, UpdateUserProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setFirstName(request.getFirstName());
        user.setMiddleName(request.getMiddleName());
        user.setLastName(request.getLastName());
        user.setMobile(request.getMobile());
        user.setDob(request.getDob());
        user.setGithubLink(request.getGithubLink());

        // Only update if new one is provided.
        if (request.getResumeFileName() != null && !request.getResumeFileName().isBlank()) {
            user.setResumeUrl(request.getResumeFileName());
        }

        user.setSkills(request.getSkills());
        user.setAchievements(request.getAchievements());
        if (request.getProfilePhoto() != null && !request.getProfilePhoto().isBlank()) {
            user.setProfilePhoto(request.getProfilePhoto());
        }

        return userRepository.save(user);
    }
}
