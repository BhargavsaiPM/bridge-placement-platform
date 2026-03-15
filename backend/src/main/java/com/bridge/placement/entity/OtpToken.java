package com.bridge.placement.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

/**
 * Stores OTPs in DB instead of in-memory Map.
 * B1 fix: OTPs survive server restarts.
 * B2 fix: OTP has createdAt for expiry checking (10 min threshold).
 */
@Entity
@Table(name = "otp_tokens")
@Data
public class OtpToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String email;

    @Column(nullable = false)
    private String otp;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    public OtpToken() {
        this.createdAt = LocalDateTime.now();
    }

    public OtpToken(String email, String otp) {
        this.email = email;
        this.otp = otp;
        this.createdAt = LocalDateTime.now();
    }
}
