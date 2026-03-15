package com.bridge.placement.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

/**
 * N5 fix: Tracks every successful login.
 * Allows Admin to see login history via GET /admin/login-logs.
 */
@Entity
@Table(name = "login_logs")
@Data
public class LoginLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String email;

    @Column(nullable = false)
    private String role;

    @Column(nullable = false)
    private LocalDateTime loginTime;

    private String ipAddress;

    public LoginLog() {}

    public LoginLog(String email, String role, String ipAddress) {
        this.email = email;
        this.role = role;
        this.loginTime = LocalDateTime.now();
        this.ipAddress = ipAddress;
    }
}
