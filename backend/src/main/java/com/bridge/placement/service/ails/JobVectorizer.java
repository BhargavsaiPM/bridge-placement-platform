package com.bridge.placement.service.ails;

import com.bridge.placement.entity.Job;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Vectorizes a Job posting into structured components for AILS comparison.
 */
@Service
public class JobVectorizer {

    /**
     * Extract required skills as a normalized list.
     */
    public List<String> extractRequiredSkills(Job job) {
        if (job.getRequiredSkills() == null || job.getRequiredSkills().isBlank()) {
            return new ArrayList<>();
        }
        return Arrays.stream(job.getRequiredSkills().split(","))
                .map(String::trim)
                .map(String::toLowerCase)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.toList());
    }

    /**
     * Extract preferred/bonus skills as a normalized list.
     */
    public List<String> extractPreferredSkills(Job job) {
        if (job.getPreferredSkills() == null || job.getPreferredSkills().isBlank()) {
            return new ArrayList<>();
        }
        return Arrays.stream(job.getPreferredSkills().split(","))
                .map(String::trim)
                .map(String::toLowerCase)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.toList());
    }

    /**
     * Build a full text corpus from job fields for keyword similarity.
     * Combines title, description, and required skills.
     */
    public String buildTextCorpus(Job job) {
        StringBuilder sb = new StringBuilder();
        if (job.getTitle() != null)
            sb.append(job.getTitle()).append(" ");
        if (job.getDescription() != null)
            sb.append(job.getDescription()).append(" ");
        if (job.getRequiredSkills() != null)
            sb.append(job.getRequiredSkills()).append(" ");
        if (job.getPreferredSkills() != null)
            sb.append(job.getPreferredSkills()).append(" ");
        return sb.toString().trim();
    }

    /**
     * Extract keywords from the job description for project relevance scoring.
     * Returns a set of lowercase non-trivial words.
     */
    public List<String> extractDescriptionKeywords(Job job) {
        String text = buildTextCorpus(job);
        // Common stop words to filter
        List<String> stopWords = List.of(
                "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for",
                "of", "with", "is", "are", "was", "be", "as", "by", "we", "our",
                "you", "your", "this", "that", "will", "can", "not", "have", "has");
        return Arrays.stream(text.split("[\\s,;:.!?()\\[\\]{}\"]+"))
                .map(String::toLowerCase)
                .filter(w -> w.length() > 2 && !stopWords.contains(w))
                .distinct()
                .collect(Collectors.toList());
    }
}
