package com.bridge.placement.service.ails;

import com.bridge.placement.entity.User;
import com.bridge.placement.enums.UserType;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.Period;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Parses a User entity into structured resume components for AILS scoring.
 */
@Service
public class ResumeParserService {

    /**
     * Extract normalized skill list from user's skills field (CSV).
     */
    public List<String> extractSkills(User user) {
        if (user.getSkills() == null || user.getSkills().isBlank()) {
            return new ArrayList<>();
        }
        return Arrays.stream(user.getSkills().split(","))
                .map(String::trim)
                .map(String::toLowerCase)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.toList());
    }

    /**
     * Estimate experience in years.
     * WORKING professionals get a conservative 2-year base.
     * DOB-based calculation: if WORKING and age > 22, (age - 22) years.
     */
    public int extractExperienceYears(User user) {
        if (user.getRoleType() == UserType.STUDENT) {
            return 0;
        }
        // Working professional — estimate from age
        if (user.getDob() != null) {
            int age = Period.between(user.getDob(), LocalDate.now()).getYears();
            int estimatedYears = Math.max(0, age - 22); // assume graduation at 22
            return Math.min(estimatedYears, 20); // cap at 20 years
        }
        return 2; // conservative default for WORKING
    }

    /**
     * Build a free-text corpus from all user profile text fields.
     * Used for keyword similarity comparison.
     */
    public String buildTextCorpus(User user) {
        StringBuilder sb = new StringBuilder();
        if (user.getSkills() != null)
            sb.append(user.getSkills()).append(" ");
        if (user.getAchievements() != null)
            sb.append(user.getAchievements()).append(" ");
        return sb.toString().trim();
    }

    /**
     * Infer education level from role type.
     * Returns a score 0–10 for AILS education component.
     */
    public double scoreEducation(User user) {
        if (user.getRoleType() == null)
            return 5.0;
        return switch (user.getRoleType()) {
            case WORKING -> 10.0; // assumed graduate + work experience
            case STUDENT -> 7.0; // current student, some bonus
        };
    }

    /**
     * Check for certification keywords in achievements text.
     */
    public double scoreCertifications(User user) {
        if (user.getAchievements() == null || user.getAchievements().isBlank())
            return 0.0;

        String lower = user.getAchievements().toLowerCase();
        // Common certification markers
        String[] certKeywords = {
                "certified", "certification", "certificate", "aws", "azure", "gcp",
                "oracle", "microsoft certified", "google certified", "pmp", "cissp",
                "comptia", "coursera", "udemy", "linkedin learning", "hackerrank",
                "leetcode", "topcoder", "kaggle"
        };

        long matches = Arrays.stream(certKeywords)
                .filter(lower::contains)
                .count();

        // Each cert keyword match gives 1 point, max 5
        return Math.min(5.0, matches * 1.25);
    }
}
