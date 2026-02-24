package com.bridge.placement.service.ails;

import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Computes TF-IDF cosine similarity between two text corpora.
 *
 * Algorithm:
 * 1. Tokenize both documents
 * 2. Compute Term Frequency (TF) per document
 * 3. Compute IDF based on combined vocabulary (2-document corpus)
 * 4. Build TF-IDF vectors
 * 5. Return cosine similarity: dot(A, B) / (|A| * |B|)
 *
 * Result is a double in [0.0, 1.0].
 */
@Service
public class SimilarityCalculator {

    private static final List<String> STOP_WORDS = List.of(
            "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for",
            "of", "with", "is", "are", "was", "be", "as", "by", "we", "our",
            "you", "your", "this", "that", "will", "can", "not", "have", "has",
            "experience", "years", "job", "role", "position", "candidate");

    /**
     * Compute cosine similarity between two text documents.
     *
     * @param doc1 First document (e.g. user resume corpus)
     * @param doc2 Second document (e.g. job description corpus)
     * @return Similarity score in [0.0, 1.0]
     */
    public double compute(String doc1, String doc2) {
        if (doc1 == null || doc1.isBlank() || doc2 == null || doc2.isBlank()) {
            return 0.0;
        }

        List<String> tokens1 = tokenize(doc1);
        List<String> tokens2 = tokenize(doc2);

        if (tokens1.isEmpty() || tokens2.isEmpty())
            return 0.0;

        // Build vocabulary
        Set<String> vocabulary = tokens1.stream()
                .collect(Collectors.toSet());
        vocabulary.addAll(tokens2);

        // TF for each document
        Map<String, Double> tf1 = computeTF(tokens1);
        Map<String, Double> tf2 = computeTF(tokens2);

        // IDF based on 2-document corpus
        Map<String, Double> idf = computeIDF(List.of(tokens1, tokens2), vocabulary);

        // TF-IDF vectors
        Map<String, Double> tfidf1 = computeTFIDF(tf1, idf, vocabulary);
        Map<String, Double> tfidf2 = computeTFIDF(tf2, idf, vocabulary);

        // Cosine similarity
        return cosineSimilarity(tfidf1, tfidf2, vocabulary);
    }

    // --- Private helpers ---

    private List<String> tokenize(String text) {
        return Arrays.stream(text.toLowerCase().split("[\\s,;:.!?()\\[\\]{}\"\\-/]+"))
                .filter(w -> w.length() > 2 && !STOP_WORDS.contains(w))
                .collect(Collectors.toList());
    }

    private Map<String, Double> computeTF(List<String> tokens) {
        Map<String, Long> freq = tokens.stream()
                .collect(Collectors.groupingBy(w -> w, Collectors.counting()));
        int total = tokens.size();
        Map<String, Double> tf = new HashMap<>();
        freq.forEach((word, count) -> tf.put(word, (double) count / total));
        return tf;
    }

    private Map<String, Double> computeIDF(List<List<String>> corpus, Set<String> vocabulary) {
        int numDocs = corpus.size();
        Map<String, Double> idf = new HashMap<>();
        for (String term : vocabulary) {
            long docCount = corpus.stream()
                    .filter(doc -> doc.contains(term))
                    .count();
            // IDF = log((1 + N) / (1 + df)) + 1 (smooth IDF)
            idf.put(term, Math.log((1.0 + numDocs) / (1.0 + docCount)) + 1.0);
        }
        return idf;
    }

    private Map<String, Double> computeTFIDF(Map<String, Double> tf,
            Map<String, Double> idf,
            Set<String> vocabulary) {
        Map<String, Double> tfidf = new HashMap<>();
        for (String term : vocabulary) {
            double tfVal = tf.getOrDefault(term, 0.0);
            double idfVal = idf.getOrDefault(term, 1.0);
            tfidf.put(term, tfVal * idfVal);
        }
        return tfidf;
    }

    private double cosineSimilarity(Map<String, Double> v1,
            Map<String, Double> v2,
            Set<String> vocabulary) {
        double dot = 0.0, norm1 = 0.0, norm2 = 0.0;
        for (String term : vocabulary) {
            double a = v1.getOrDefault(term, 0.0);
            double b = v2.getOrDefault(term, 0.0);
            dot += a * b;
            norm1 += a * a;
            norm2 += b * b;
        }
        if (norm1 == 0 || norm2 == 0)
            return 0.0;
        return dot / (Math.sqrt(norm1) * Math.sqrt(norm2));
    }
}
