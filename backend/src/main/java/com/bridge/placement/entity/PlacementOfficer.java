package com.bridge.placement.entity;

import com.bridge.placement.enums.Role;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "placement_officers")
@Getter
@Setter
public class PlacementOfficer extends BaseEntity {

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @JsonIgnore
    @Column(nullable = false)
    private String password;

    private Integer age;
    private LocalDate dateOfBirth;
    private String mobileNumber;

    private String jobRole;

    private LocalDate workingSince;

    private String department;
    private String bloodGroup;
    private String doorNumber;
    private String streetName;
    private String landmark;
    private String city;
    private String district;
    private String state;
    private String pincode;
    private String country;
    private String address;

    @Column(length = 1000)
    private String profilePhoto;

    @JsonIgnore
    @ManyToOne(optional = false)
    @JoinColumn(name = "company_id", nullable = false)
    private Company company;

    @Column(nullable = false, columnDefinition = "boolean default false")
    private boolean approved = false;

    private boolean active = true;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role = Role.PLACEMENT_OFFICER;

    // N6: Force officer to change password on first login
    @Column(nullable = false)
    private boolean requiresPasswordChange = true;

    // N4: Track when officer was last active
    private LocalDateTime lastSeen;

    @JsonIgnore
    @ManyToMany(mappedBy = "assignedOfficers")
    private List<Job> assignedJobs = new ArrayList<>();
}
