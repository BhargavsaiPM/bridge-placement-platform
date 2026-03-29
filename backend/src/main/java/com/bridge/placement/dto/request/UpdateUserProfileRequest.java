package com.bridge.placement.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import java.time.LocalDate;

@Data
public class UpdateUserProfileRequest {
    @NotBlank
    private String firstName;

    private String middleName;

    @NotBlank
    private String lastName;

    private String mobile;
    private LocalDate dob;
    private String country;
    private String state;
    private String district;
    private String pincode;
    private String city;
    private String street;
    private String doorNumber;
    private String githubLink;
    private String resumeFileName;
    private String skills;
    private String achievements;
    private String profilePhoto;
    private String highestQualification;
    private Double cgpa;
    private String specialization;
    private Integer passingYear;
    private Integer experienceYears;
}
