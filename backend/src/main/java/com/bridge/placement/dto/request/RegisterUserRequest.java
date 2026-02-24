package com.bridge.placement.dto.request;

import com.bridge.placement.enums.UserType;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDate;

@Data
public class RegisterUserRequest {
    @NotBlank
    @Size(min = 3, max = 50)
    private String name;

    @NotBlank
    @Size(max = 50)
    @Email
    private String email;

    @NotBlank
    @Size(min = 6, max = 40)
    private String password;

    private String mobile;

    @NotNull
    private LocalDate dob;

    @NotNull
    private UserType roleType;

    private String githubLink;
    private String resumeFileName;
    private String skills; // Comma-separated: "Java, Spring Boot, MySQL"
    private String achievements;
    private String profilePhoto;
}
