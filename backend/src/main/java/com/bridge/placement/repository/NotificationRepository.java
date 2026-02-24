package com.bridge.placement.repository;

import com.bridge.placement.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByUserEmailOrderByCreatedAtDesc(String userEmail);

    // find unread
    List<Notification> findByUserEmailAndReadFlagFalse(String userEmail);
}
