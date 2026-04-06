package com.bridge.placement.controller;

import com.bridge.placement.dto.response.MessageResponse;
import com.bridge.placement.service.CloudinaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
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
    public ResponseEntity<Map<String, String>> uploadFile(@RequestParam("file") MultipartFile file) {
        String fileUrl = cloudinaryService.uploadFile(file);
        return ResponseEntity.ok(Collections.singletonMap("url", fileUrl));
    }

    @ExceptionHandler({ IllegalArgumentException.class, IllegalStateException.class })
    public ResponseEntity<MessageResponse> handleValidationError(RuntimeException ex) {
        HttpStatus status = ex instanceof IllegalStateException ? HttpStatus.SERVICE_UNAVAILABLE : HttpStatus.BAD_REQUEST;
        return ResponseEntity.status(status).body(new MessageResponse(ex.getMessage()));
    }
}
