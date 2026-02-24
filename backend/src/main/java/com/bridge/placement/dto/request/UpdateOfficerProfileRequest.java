package com.bridge.placement.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import java.time.LocalDate;

@Data
public class UpdateOfficerProfileRequest {
    @NotBlank
    private String name;

    private Integer age;
    private String jobRole;
    private LocalDate workingSince;
    private String department;
    private String bloodGroup;
    private String profilePhoto;

    // Split Address
    private String doorNumber;
    private String streetName;
    private String city;
    private String state;
    private String pincode;
    private String country;
    private String landmark;
}
