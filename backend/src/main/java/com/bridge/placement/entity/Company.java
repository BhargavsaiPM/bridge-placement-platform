package com.bridge.placement.entity;

import com.bridge.placement.enums.CompanyType;
import com.bridge.placement.enums.IndustrySector;
import com.bridge.placement.enums.Role;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "companies")
@Getter
@Setter
public class Company extends BaseEntity {

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String domainEmail;

    @JsonIgnore
    @Column(nullable = false)
    private String password;

    private String branchAddress;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CompanyType companyType;

    @Enumerated(EnumType.STRING)
    private IndustrySector industrySector;

    @Column(nullable = false)
    private boolean approved = false;

    private boolean createdByAdmin = false;

    @Column(length = 1000)
    private String proofDocumentUrl; // Company registration certificate / proof (jpg/png/pdf)

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role = Role.COMPANY;

    @JsonIgnore
    @OneToMany(mappedBy = "company", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PlacementOfficer> placementOfficers = new ArrayList<>();
}
