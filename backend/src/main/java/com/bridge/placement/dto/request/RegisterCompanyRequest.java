package com.bridge.placement.dto.request;

import com.bridge.placement.enums.CompanyType;
import com.bridge.placement.enums.IndustrySector;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RegisterCompanyRequest {
    @NotBlank
    private String name;

    @NotBlank
    @Email
    private String domainEmail;

    @NotBlank
    @Size(min = 6, max = 40)
    private String password;

    private String doorNumber;
    private String streetName;
    private String city;
    private String state;
    private String pincode;
    private String country;
    private String landmark;

    @NotNull
    private CompanyType companyType;

    private IndustrySector industrySector; // Optional

    private String proofDocumentUrl; // Company proof document URL
}
