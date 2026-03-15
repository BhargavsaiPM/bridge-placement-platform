package com.bridge.placement.controller;

import com.bridge.placement.dto.response.MessageResponse;
import com.bridge.placement.service.CloudinaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Collections;
import java.util.Map;

/**
 * B33: File uploads now go to Cloudinary (not local disk).
 * B34: File type and size validation happens in CloudinaryService.
 * B35: Upload endpoint requires authentication (isAuthenticated).
 */
@RestController
@RequestMapping("/files")
@RequiredArgsConstructor
public class FileController {

    private final CloudinaryService cloudinaryService;

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("isAuthenticated()")   // B35 fix: must be logged in to upload
    public ResponseEntity<Map<String, String>> uploadFile(@RequestParam("file") MultipartFile file) {
        // B34: Validation (type and size) is done inside CloudinaryService.uploadFile()
        String fileUrl = cloudinaryService.uploadFile(file);
        return ResponseEntity.ok(Collections.singletonMap("url", fileUrl));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<MessageResponse> handleValidationError(IllegalArgumentException ex) {
        return ResponseEntity.badRequest().body(new MessageResponse(ex.getMessage()));
    }
}
