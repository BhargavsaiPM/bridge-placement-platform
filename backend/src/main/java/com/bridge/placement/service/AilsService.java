package com.bridge.placement.service;

import com.bridge.placement.entity.Job;
import com.bridge.placement.entity.User;
import com.bridge.placement.service.ails.AilsResult;
import com.bridge.placement.service.ails.JobVectorizer;
import com.bridge.placement.service.ails.ResumeParserService;
import com.bridge.placement.service.ails.SimilarityCalculator;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * AILS — Applicant Intelligence & Likelihood Score
 *
 * Deterministic scoring engine. No randomness. Fully explainable.
 *
 * Score breakdown (0-100):
 * 40% — Skill Match (required skills covered by user skills)
 * 20% — Keyword Similarity (TF-IDF cosine similarity of corpora)
 * 15% — Experience Match (years vs job requirement)
 * 10% — Education (role-type based)
 * 10% — Project Relevance (achievements vs job keywords)
 * 5% — Certification Bonus
 */
@Service
@RequiredArgsConstructor
public class AilsService {

    private final ResumeParserService resumeParser;
    private final JobVectorizer jobVectorizer;
    private final SimilarityCalculator similarityCalculator;

    /**
     * Primary scoring method. Called when a student applies for a job.
     *
     * @param user The applicant
     * @param job  The job posting
     * @return AilsResult with score, explanation, and suggestions
     */
    public AilsResult calculateScore(User user, Job job) {

        // === PARSE INPUTS ===
        List<String> userSkills = resumeParser.extractSkills(user);
        List<String> requiredSkills = jobVectorizer.extractRequiredSkills(job);
        List<String> preferredSkills = jobVectorizer.extractPreferredSkills(job);
        List<String> jobKeywords = jobVectorizer.extractDescriptionKeywords(job);
        int experienceYears = resumeParser.extractExperienceYears(user);
        int requiredYears = job.getExperienceRequired() != null ? job.getExperienceRequired() : 0;

        String userCorpus = resumeParser.buildTextCorpus(user);
        String jobCorpus = jobVectorizer.buildTextCorpus(job);

        // === COMPONENT 1: Skill Match (40 pts) ===
        List<String> matchedRequired = requiredSkills.stream()
                .filter(s -> userSkills.stream().anyMatch(us -> us.contains(s) || s.contains(us)))
                .collect(Collectors.toList());
        List<String> missingSkills = requiredSkills.stream()
                .filter(s -> matchedRequired.stream().noneMatch(m -> m.equals(s)))
                .collect(Collectors.toList());

        // Preferred skills give a small extra boost within this component
        List<String> matchedPreferred = preferredSkills.stream()
                .filter(s -> userSkills.stream().anyMatch(us -> us.contains(s) || s.contains(us)))
                .collect(Collectors.toList());

        double skillMatchScore;
        if (requiredSkills.isEmpty()) {
            skillMatchScore = 20.0; // half credit when no required skills defined
        } else {
            double requiredRatio = (double) matchedRequired.size() / requiredSkills.size();
            double preferredBonus = preferredSkills.isEmpty() ? 0
                    : ((double) matchedPreferred.size() / preferredSkills.size()) * 5.0;
            skillMatchScore = Math.min(40.0, requiredRatio * 35.0 + preferredBonus);
        }

        // === COMPONENT 2: Keyword Similarity (20 pts) ===
        double cosineSim = similarityCalculator.compute(userCorpus, jobCorpus);
        double keywordScore = cosineSim * 20.0;

        // === COMPONENT 3: Experience Match (15 pts) ===
        double experienceScore;
        if (requiredYears == 0) {
            experienceScore = 15.0; // no requirement = full marks
        } else if (experienceYears >= requiredYears) {
            experienceScore = 15.0; // meets or exceeds
        } else {
            experienceScore = ((double) experienceYears / requiredYears) * 15.0;
        }

        // === COMPONENT 4: Education Relevance (10 pts) ===
        double educationScore = resumeParser.scoreEducation(user);

        // === COMPONENT 5: Project Relevance (10 pts) ===
        String achievements = user.getAchievements() != null ? user.getAchievements().toLowerCase() : "";
        long projectKeywordMatches = jobKeywords.stream()
                .filter(k -> achievements.contains(k))
                .count();
        double projectScore = jobKeywords.isEmpty() ? 5.0
                : Math.min(10.0, (double) projectKeywordMatches / jobKeywords.size() * 10.0 * 3.0);
        // multiply by 3 as bonus: even partial keyword overlap scores well

        // === COMPONENT 6: Certification Bonus (5 pts) ===
        double certificationBonus = resumeParser.scoreCertifications(user);

        // === TOTAL SCORE ===
        double total = skillMatchScore + keywordScore + experienceScore
                + educationScore + projectScore + certificationBonus;
        total = Math.min(100.0, Math.max(0.0, total));
        total = Math.round(total * 10.0) / 10.0; // round to 1 decimal

        // === MATCH LEVEL ===
        String matchLevel;
        if (total >= 70)
            matchLevel = "HIGH";
        else if (total >= 45)
            matchLevel = "MEDIUM";
        else
            matchLevel = "LOW";

        // === STRONG AREAS ===
        List<String> strongAreas = new ArrayList<>(matchedRequired);
        strongAreas.addAll(matchedPreferred);

        // === IMPROVEMENT SUGGESTIONS ===
        List<String> suggestions = new ArrayList<>();
        if (!missingSkills.isEmpty()) {
            suggestions.add("Learn missing required skills: "
                    + String.join(", ", missingSkills.stream().limit(3).collect(Collectors.toList())));
        }
        if (cosineSim < 0.3) {
            suggestions.add(
                    "Your profile keywords don't closely align with the job description. Update your skills and achievements to include relevant domain terms.");
        }
        if (experienceYears < requiredYears) {
            suggestions.add("This role requires " + requiredYears
                    + " year(s) of experience. Consider applying to junior-level roles or building more project experience.");
        }
        if (user.getAchievements() == null || user.getAchievements().length() < 50) {
            suggestions.add(
                    "Expand your achievements/projects section with specific technologies, metrics, and outcomes you delivered.");
        }
        if (certificationBonus < 2.5) {
            suggestions.add(
                    "Adding relevant certifications (AWS, Google, Oracle, etc.) will significantly boost your profile score.");
        }

        // === EXPLANATION ===
        String explanation = String.format(
                "AILS Score: %.1f/100 | Match: %s | " +
                        "Skill Match: %.1f/40 (%d/%d required skills matched) | " +
                        "Keyword Similarity: %.1f/20 (%.0f%% corpus match) | " +
                        "Experience: %.1f/15 (%d/%d yrs) | " +
                        "Education: %.1f/10 | Project Relevance: %.1f/10 | Cert Bonus: %.1f/5",
                total, matchLevel,
                skillMatchScore, matchedRequired.size(), requiredSkills.size(),
                keywordScore, cosineSim * 100,
                experienceScore, experienceYears, requiredYears,
                educationScore, projectScore, certificationBonus);

        // === EXCEPTION FLAG ===
        // High-experience candidate with surprisingly low score — flag for manual
        // review
        boolean exceptionFlag = (total < 40.0 && experienceYears > 3);

        return AilsResult.builder()
                .score(total)
                .matchLevel(matchLevel)
                .explanation(explanation)
                .missingSkills(missingSkills)
                .strongAreas(strongAreas)
                .improvementSuggestions(suggestions)
                .exceptionFlag(exceptionFlag)
                .skillMatchScore(skillMatchScore)
                .keywordScore(keywordScore)
                .experienceScore(experienceScore)
                .educationScore(educationScore)
                .projectScore(projectScore)
                .certificationBonus(certificationBonus)
                .build();
    }
}
