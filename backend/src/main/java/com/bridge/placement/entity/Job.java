package com.bridge.placement.entity;

import com.bridge.placement.enums.JobStatus;
import com.bridge.placement.enums.JobType;
import com.bridge.placement.enums.WorkMode;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.FetchType;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "jobs")
@Getter
@Setter
public class Job extends BaseEntity {

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "TEXT")
    private String minimumQualifications;

    @Column(columnDefinition = "TEXT")
    private String preferredQualifications;

    @ManyToOne(optional = false)
    @JoinColumn(name = "company_id", nullable = false)
    private Company company;

    private String requiredSkills; // CSV, e.g. "Java, Spring Boot"

    private String preferredSkills; // CSV, bonus skills

    private Integer experienceRequired; // Years

    private String salaryRange;

    private String location;

    @Enumerated(EnumType.STRING)
    private WorkMode workMode;

    @Enumerated(EnumType.STRING)
    private JobType jobType;

    private LocalDate applicationDeadline;

    private Integer maxApplicants;

    @Column(nullable = false)
    private boolean blockedByAdmin = false;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private JobStatus status = JobStatus.DRAFT;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
            name = "job_assignment_officers",
            joinColumns = @JoinColumn(name = "job_id"),
            inverseJoinColumns = @JoinColumn(name = "officer_id"))
    private List<PlacementOfficer> assignedOfficers = new ArrayList<>();

    @JsonIgnore
    @OneToMany(mappedBy = "job", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<JobRound> rounds = new ArrayList<>();
}
