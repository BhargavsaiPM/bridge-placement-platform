package com.bridge.placement.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import java.time.LocalDate;

@Data
public class UpdateUserProfileRequest {
    @NotBlank
    private String name;

    private String mobile;
    private LocalDate dob;
    private String githubLink;
    private String resumeFileName;
    private String skills;
    private String achievements;
    private String profilePhoto;
}
