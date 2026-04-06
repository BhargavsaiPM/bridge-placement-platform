package com.bridge.placement.service;

import com.bridge.placement.dto.response.AtsScoreResponse;
import com.bridge.placement.entity.Job;
import com.bridge.placement.entity.User;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.io.InputStream;
import java.net.URL;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class AtsService {

    @Value("${gemini.api.key}")
    private String geminiApiKey;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public AtsScoreResponse calculateAtsScore(User user, Job job) {
        if (user.getResumeUrl() == null || user.getResumeUrl().isBlank()) {
            throw new RuntimeException("No resume found. Please upload your resume first to calculate ATS score.");
        }

        String resumeText = extractTextFromPdf(user.getResumeUrl());
        if (resumeText == null || resumeText.isBlank()) {
            throw new RuntimeException("Could not extract text from the resume. Make sure it's a valid text-based PDF.");
        }

        return callGeminiApi(resumeText, job);
    }

    private String extractTextFromPdf(String pdfUrl) {
        try (InputStream in = new URL(pdfUrl).openStream();
             PDDocument document = PDDocument.load(in)) {
             
            PDFTextStripper stripper = new PDFTextStripper();
            return stripper.getText(document);
        } catch (Exception e) {
            log.error("Failed to read PDF from URL: {}", pdfUrl, e);
            throw new RuntimeException("Error processing PDF document: " + e.getMessage());
        }
    }

    private AtsScoreResponse callGeminiApi(String resumeText, Job job) {
        String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=" + geminiApiKey;

        String prompt = "You are an expert strict ATS (Applicant Tracking System). Analyze the following resume against the job description.\n" +
                "Job Title: " + job.getTitle() + "\n" +
                "Job Description: " + job.getDescription() + "\n" +
                "Job Skills: " + job.getRequiredSkills() + "\n\n" +
                "Resume Text:\n" + resumeText + "\n\n" +
                "Evaluate and return exactly a JSON response (DO NOT wrap in ```json or any other text, just pure JSON).\n" +
                "Format:\n" +
                "{\n" +
                "  \"score\": <integer out of 100>,\n" +
                "  \"matchPercentage\": \"<X>%\",\n" +
                "  \"missingSkills\": [\"skill1\", \"skill2\"],\n" +
                "  \"matchingSkills\": [\"skill1\", \"skill2\"],\n" +
                "  \"generalFeedback\": \"<short feedback>\"\n" +
                "}";

        Map<String, Object> textPart = new HashMap<>();
        textPart.put("text", prompt);

        Map<String, Object> partObj = new HashMap<>();
        partObj.put("parts", List.of(textPart));

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("contents", List.of(partObj));

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        try {
            ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);
            return parseGeminiResponse(response.getBody());
        } catch (Exception e) {
            log.error("Failed to call Gemini API", e);
            throw new RuntimeException("AI processing failed. Please try again later.", e);
        }
    }

    private AtsScoreResponse parseGeminiResponse(String responseBody) throws Exception {
        JsonNode rootNode = objectMapper.readTree(responseBody);
        JsonNode candidates = rootNode.path("candidates");
        if (candidates.isArray() && candidates.size() > 0) {
            JsonNode textNode = candidates.get(0).path("content").path("parts").get(0).path("text");
            String rawJson = textNode.asText();
            
            // Clean up possible markdown wrappers returned by the AI
            if (rawJson.startsWith("```json")) {
                rawJson = rawJson.replace("```json", "").replace("```", "").trim();
            } else if (rawJson.startsWith("```")) {
                rawJson = rawJson.replace("```", "").trim();
            }
            
            return objectMapper.readValue(rawJson, AtsScoreResponse.class);
        }
        throw new RuntimeException("Unexpected response format from AI API.");
    }
}
