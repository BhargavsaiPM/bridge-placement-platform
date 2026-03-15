package com.bridge.placement.repository;

import com.bridge.placement.entity.OtpToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Repository
public interface OtpTokenRepository extends JpaRepository<OtpToken, Long> {

    Optional<OtpToken> findTopByEmailOrderByCreatedAtDesc(String email);

    @Modifying
    @Transactional
    @Query("DELETE FROM OtpToken o WHERE o.email = :email")
    void deleteByEmail(String email);
}
