package com.bridge.placement.dto.request;

import com.bridge.placement.enums.JobType;
import com.bridge.placement.enums.WorkMode;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
public class JobRequest {
    @NotBlank
    private String title;

    @NotBlank
    private String description;

    @NotBlank
    private String requiredSkills;

    @NotNull
    private Integer experienceRequired;

    @NotBlank
    private String salaryRange;

    @NotBlank
    private String location;

    @NotNull
    private WorkMode workMode;

    @NotNull
    private JobType jobType;

    @NotNull
    private LocalDate applicationDeadline;

    private Integer maxApplicants;

    // Rounds
    private List<String> rounds; // Simple list of round names or objects
}
