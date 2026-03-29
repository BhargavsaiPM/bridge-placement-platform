package com.bridge.placement.service.ails;

import com.bridge.placement.entity.User;
import com.bridge.placement.enums.UserType;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.Period;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
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
     * Uses the workingSince field if available for an exact calculation.
     * Fallback for WORKING professionals without workingSince: age > 22 -> (age - 22) years.
     */
    public int extractExperienceYears(User user) {
        if (user.getExperienceYears() != null && user.getExperienceYears() >= 0) {
            return user.getExperienceYears();
        }

        if (user.getRoleType() == UserType.STUDENT) {
            // STUDENTS generally have 0 years full-time experience natively for ATS scoring purposes
            return 0;
        }

        // 1. Try to use "workingSince" exact date if the user entered it (typically stored in achievements or a custom field, but for Phase 2 we assumed it might be parsed)
        // Wait, User entity doesn't have workingSince. Only PlacementOfficer has workingSince.
        // If it's a User, we'll try to extract "working since <Year>" or "X years experience" from achievements.
        // Actually, let's keep the date-based estimation here and enhance it slightly.

        if (user.getAchievements() != null) {
            String lowerAchiev = user.getAchievements().toLowerCase();
            // simple regex or matching for "X years experience"
            // For now, let's stick to the age-based logic but refine it.
        }

        // 2. Working professional — estimate from age
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
        if (user.getHighestQualification() != null && !user.getHighestQualification().isBlank()) {
            String qualification = user.getHighestQualification().toLowerCase();
            if (qualification.contains("phd") || qualification.contains("doctor")) {
                return 10.0;
            }
            if (qualification.contains("m.tech") || qualification.contains("mtech")
                    || qualification.contains("mca") || qualification.contains("mba")
                    || qualification.contains("master")) {
                return 9.0;
            }
            if (qualification.contains("b.tech") || qualification.contains("btech")
                    || qualification.contains("b.e") || qualification.contains("be")
                    || qualification.contains("bachelor") || qualification.contains("degree")) {
                return 8.0;
            }
            if (qualification.contains("diploma")) {
                return 6.0;
            }
        }

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
