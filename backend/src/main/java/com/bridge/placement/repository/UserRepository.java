package com.bridge.placement.repository;

import com.bridge.placement.entity.User;
import com.bridge.placement.enums.UserType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    // Pending users by type (for admin approval tabs)
    List<User> findByApprovedFalseAndBlockedFalseAndRoleType(UserType roleType);

    // All pending users
    List<User> findByApprovedFalse();

    // Approved users
    List<User> findByApprovedTrue();

    // Counts
    long countByApproved(boolean approved);

    long countByApprovedAndRoleType(boolean approved, UserType roleType);
}
