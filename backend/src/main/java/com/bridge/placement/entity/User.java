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

    @Column(nullable = false, unique = true)
    private String email;

    @JsonIgnore
    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String name;

    private String mobile;

    private LocalDate dob;

    @Enumerated(EnumType.STRING)
    @Column(name = "user_type")
    private UserType roleType; // STUDENT, WORKING

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role = Role.USER; // Always USER for this entity

    @Column(length = 1000)
    private String profilePhoto;

    private String githubLink;

    private String resumeUrl; // PDF only link

    @Column(columnDefinition = "TEXT")
    private String skills; // Comma-separated list, e.g. "Java, Spring Boot, MySQL"

    @Column(columnDefinition = "TEXT")
    private String achievements;
}
