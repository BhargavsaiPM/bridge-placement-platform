package com.bridge.placement.entity;

import com.bridge.placement.enums.Role;
import com.bridge.placement.enums.UserType;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Entity
@Table(name = "users")
@Getter
@Setter
public class User extends BaseEntity {

    // ===== Name Fields =====
    @Column(nullable = false)
    private String firstName;

    private String middleName; // Optional

    @Column(nullable = false)
    private String lastName;

    // ===== Auth / Contact =====
    @Column(nullable = false, unique = true)
    private String email; // Personal mail ID

    @JsonIgnore
    @Column(nullable = false)
    private String password;

    private String mobile;

    private LocalDate dob;

    @Enumerated(EnumType.STRING)
    @Column(name = "user_type")
    private UserType roleType; // STUDENT, WORKING

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role = Role.USER;

    // ===== Student-Specific Fields =====
    private String collegeRollNumber;
    private String collegeMailId;
    private String collegeName;
    private String collegeCity;
    private String collegeDistrict;
    private String collegeCountry;
    private String collegePincode;

    @Column(length = 1000)
    private String studentIdCardUrl; // jpg/png

    // ===== Working Professional-Specific Fields =====
    private String employeeId;
    private String companyMailId;
    private String companyName;
    private String companyCity;
    private String companyDistrict;
    private String companyCountry;
    private String companyPincode;
    private String currentPosition;

    @Column(length = 1000)
    private String employeeIdCardUrl; // jpg/png

    // ===== Personal Address =====
    private String country;
    private String state;
    private String district;
    private String pincode;
    private String city;
    private String street;
    private String doorNumber;

    // ===== Documents =====
    @Column(length = 1000)
    private String profilePhoto;

    private String githubLink;

    @Column(length = 1000)
    private String resumeUrl; // PDF only link

    @Column(columnDefinition = "TEXT")
    private String skills; // Comma-separated

    @Column(columnDefinition = "TEXT")
    private String achievements;

    // ===== Approval =====
    @Column(nullable = false)
    private boolean approved = false;

    @Column(nullable = false)
    private boolean blocked = false;

    // Helper to get full name
    public String getFullName() {
        StringBuilder sb = new StringBuilder(firstName);
        if (middleName != null && !middleName.isBlank()) {
            sb.append(" ").append(middleName);
        }
        sb.append(" ").append(lastName);
        return sb.toString();
    }
}
