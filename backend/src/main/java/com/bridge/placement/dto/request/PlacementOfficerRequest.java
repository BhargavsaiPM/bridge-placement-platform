package com.bridge.placement.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class PlacementOfficerRequest {
    @NotBlank
    private String name;

    @NotBlank
    @Email
    private String email;

    @NotBlank
    private String password;

    private Integer age;
    private String jobRole;
    private LocalDate workingSince;
    private String profilePhoto;

    private String department;
    private String bloodGroup;

    private String doorNumber;
    private String streetName;
    private String city;
    private String state;
    private String pincode;
    private String country;
}
