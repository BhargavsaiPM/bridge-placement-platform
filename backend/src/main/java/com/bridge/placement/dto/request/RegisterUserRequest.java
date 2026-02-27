package com.bridge.placement.dto.request;

import com.bridge.placement.enums.UserType;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDate;

@Data
public class RegisterUserRequest {
    // ===== Name =====
    @NotBlank
    private String firstName;

    private String middleName; // Optional

    @NotBlank
    private String lastName;

    // ===== Auth =====
    @NotBlank
    @Email
    private String email; // Personal mail ID

    @NotBlank
    @Size(min = 6, max = 40)
    @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&#^()\\-_+=])[A-Za-z\\d@$!%*?&#^()\\-_+=]{6,}$", message = "Password must contain uppercase, lowercase, number, and symbol")
    private String password;

    private String mobile;

    @NotNull
    private LocalDate dob;

    @NotNull
    private UserType roleType; // STUDENT or WORKING

    // ===== Student-Specific =====
    private String collegeRollNumber;
    @Email
    private String collegeMailId;
    private String collegeName;
    private String collegeCity;
    private String collegeDistrict;
    private String collegeCountry;
    private String collegePincode;
    private String studentIdCardUrl; // uploaded file URL

    // ===== Professional-Specific =====
    private String employeeId;
    @Email
    private String companyMailId;
    private String companyName;
    private String companyCity;
    private String companyDistrict;
    private String companyCountry;
    private String companyPincode;
    private String currentPosition;
    private String employeeIdCardUrl; // uploaded file URL

    // ===== Personal Address =====
    private String country;
    private String state;
    private String district;
    private String pincode;
    private String city;
    private String street;
    private String doorNumber;

    // ===== Optional Extras =====
    private String githubLink;
    private String resumeFileName; // uploaded resume URL
    private String skills; // Comma-separated
    private String achievements;
    private String profilePhoto;
}
