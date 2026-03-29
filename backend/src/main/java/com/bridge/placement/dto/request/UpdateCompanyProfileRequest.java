package com.bridge.placement.dto.request;

import com.bridge.placement.enums.CompanyType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateCompanyProfileRequest {

    @NotBlank(message = "Company name is required")
    private String name;

    @NotBlank(message = "Branch address is required")
    private String branchAddress;

    private String description;
    private String profilePhoto;

    @NotNull(message = "Company type is required")
    private CompanyType companyType;
}
