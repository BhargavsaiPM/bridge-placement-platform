package com.bridge.placement.service;

import com.bridge.placement.entity.Notification;
import com.bridge.placement.enums.NotificationType;
import com.bridge.placement.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;

    @Transactional
    public void createNotification(String userEmail, String title, String message, NotificationType type) {
        Notification notification = new Notification();
        notification.setUserEmail(userEmail);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setType(type);
        notification.setReadFlag(false);
        notificationRepository.save(notification);
    }

    public List<Notification> getUserNotifications(String userEmail) {
        return notificationRepository.findByUserEmailOrderByCreatedAtDesc(userEmail);
    }

    @Transactional
    public void markAsRead(Long notificationId) {
        notificationRepository.findById(notificationId).ifPresent(n -> {
            n.setReadFlag(true);
            notificationRepository.save(n);
        });
    }

    @Transactional
    public void markAllAsRead(String userEmail) {
        List<Notification> list = notificationRepository.findByUserEmailAndReadFlagFalse(userEmail);
        list.forEach(n -> n.setReadFlag(true));
        notificationRepository.saveAll(list);
    }
}
