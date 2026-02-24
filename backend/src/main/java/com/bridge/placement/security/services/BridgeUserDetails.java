package com.bridge.placement.security.services;

import com.bridge.placement.entity.Admin;
import com.bridge.placement.entity.Company;
import com.bridge.placement.entity.PlacementOfficer;
import com.bridge.placement.entity.User;
import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Collections;
import java.util.List;

@EqualsAndHashCode(of = "id")
public class BridgeUserDetails implements UserDetails {
    private static final long serialVersionUID = 1L;

    private Long id;
    private String username;
    private String email;
    @JsonIgnore
    private String password;
    private Collection<? extends GrantedAuthority> authorities;

    private boolean isApproved = true; // Default to true for users/admins

    public Long getId() {
        return id;
    }

    public String getEmail() {
        return email;
    }

    public BridgeUserDetails(Long id, String username, String email, String password,
            Collection<? extends GrantedAuthority> authorities) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.password = password;
        this.authorities = authorities;
    }

    public BridgeUserDetails(Long id, String username, String email, String password,
            Collection<? extends GrantedAuthority> authorities, boolean isApproved) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.password = password;
        this.authorities = authorities;
        this.isApproved = isApproved;
    }

    public static BridgeUserDetails build(User user) {
        List<GrantedAuthority> authorities = Collections.singletonList(
                new SimpleGrantedAuthority("ROLE_" + user.getRole().name()));

        return new BridgeUserDetails(
                user.getId(),
                user.getEmail(),
                user.getEmail(),
                user.getPassword(),
                authorities);
    }

    public static BridgeUserDetails build(Company company) {
        List<GrantedAuthority> authorities = Collections.singletonList(
                new SimpleGrantedAuthority("ROLE_" + company.getRole().name()));

        return new BridgeUserDetails(
                company.getId(),
                company.getDomainEmail(),
                company.getDomainEmail(),
                company.getPassword(),
                authorities,
                company.isApproved());
    }

    public static BridgeUserDetails build(PlacementOfficer officer) {
        List<GrantedAuthority> authorities = Collections.singletonList(
                new SimpleGrantedAuthority("ROLE_" + officer.getRole().name()));

        return new BridgeUserDetails(
                officer.getId(),
                officer.getEmail(),
                officer.getEmail(),
                officer.getPassword(),
                authorities);
    }

    public static BridgeUserDetails build(Admin admin) {
        List<GrantedAuthority> authorities = Collections.singletonList(
                new SimpleGrantedAuthority("ROLE_" + admin.getRole().name()));

        return new BridgeUserDetails(
                admin.getId(),
                admin.getEmail(),
                admin.getEmail(),
                admin.getPassword(),
                authorities);
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return username;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return isApproved;
    }
}
