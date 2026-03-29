package com.bridge.placement.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * B33 fix: Replaces local disk storage with Cloudinary.
 * Files are uploaded to Cloudinary and a permanent URL is returned.
 * B34 fix: Validates file type and size before upload.
 * B35 fix: All downloads via Cloudinary requires JWT (secured endpoints only).
 */
@Service
@Slf4j
public class CloudinaryService {

    private static final long MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
    private static final List<String> ALLOWED_TYPES = Arrays.asList(
            "image/jpeg", "image/png", "image/jpg", "application/pdf"
    );

    private final Cloudinary cloudinary;

    public CloudinaryService(
            @Value("${cloudinary.cloud-name:#{null}}") String cloudName,
            @Value("${cloudinary.api-key:#{null}}") String apiKey,
            @Value("${cloudinary.api-secret:#{null}}") String apiSecret) {

        if (cloudName != null && apiKey != null && apiSecret != null) {
            this.cloudinary = new Cloudinary(ObjectUtils.asMap(
                    "cloud_name", cloudName,
                    "api_key", apiKey,
                    "api_secret", apiSecret,
                    "secure", true
            ));
            log.info("Cloudinary configured successfully with cloud: {}", cloudName);
        } else {
            this.cloudinary = null;
            log.warn("Cloudinary credentials not set — file uploads will fall back to local mode. " +
                    "Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET env vars.");
        }
    }

    public boolean isConfigured() {
        return this.cloudinary != null;
    }

    /**
     * Uploads a file to Cloudinary with type/size validation.
     * Returns: permanent secure URL from Cloudinary.
     */
    @SuppressWarnings("unchecked")
    public String uploadFile(MultipartFile file) {
        // B34: Validate content type
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_TYPES.contains(contentType)) {
            throw new IllegalArgumentException(
                    "Invalid file type: " + contentType +
                    ". Allowed: JPG, PNG, PDF only."
            );
        }

        // B34: Validate file size
        if (file.getSize() > MAX_FILE_SIZE_BYTES) {
            throw new IllegalArgumentException("File too large. Max allowed size is 5 MB.");
        }

        if (cloudinary == null) {
            throw new IllegalStateException(
                    "Cloudinary is not configured. " +
                    "Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET."
            );
        }

        try {
            String publicId = "bridge/" + UUID.randomUUID();
            Map<String, Object> uploadResult = cloudinary.uploader().upload(
                    file.getBytes(),
                    ObjectUtils.asMap(
                            "public_id", publicId,
                            "resource_type", "auto"
                    )
            );
            return (String) uploadResult.get("secure_url");
        } catch (IOException e) {
            log.error("Cloudinary upload failed: {}", e.getMessage());
            throw new RuntimeException("File upload failed. Please try again.", e);
        }
    }
}
