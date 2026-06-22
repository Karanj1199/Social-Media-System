package com.socialmedia.notification.service;

import com.socialmedia.notification.dto.NotificationResponse;
import com.socialmedia.notification.entity.Notification;
import com.socialmedia.notification.repository.NotificationRepository;
import com.socialmedia.user.entity.User;
import com.socialmedia.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public NotificationResponse createNotification(
            Long recipientId,
            Long actorId,
            String type,
            String message
    ) {
        User recipient = userRepository.findById(recipientId)
                .orElseThrow(() -> new RuntimeException("Recipient not found"));

        User actor = null;

        if (actorId != null) {
            actor = userRepository.findById(actorId)
                    .orElseThrow(() -> new RuntimeException("Actor not found"));
        }

        Notification notification = Notification.builder()
                .type(type)
                .message(message)
                .recipient(recipient)
                .actor(actor)
                .isRead(false)
                .build();

        Notification savedNotification = notificationRepository.save(notification);

        return mapToResponse(savedNotification);
    }

    public NotificationResponse createNotification(
            Long recipientId,
            String type,
            String message
    ) {
        return createNotification(recipientId, null, type, message);
    }

    public List<NotificationResponse> getNotifications(Long recipientId) {
        return notificationRepository.findByRecipientIdOrderByCreatedAtDesc(recipientId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public long getUnreadCount(Long recipientId) {
        return notificationRepository.countByRecipientIdAndIsReadFalse(recipientId);
    }

    public void markAsRead(Long notificationId, Long currentUserId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));

        if (!notification.getRecipient().getId().equals(currentUserId)) {
            throw new RuntimeException("You cannot update this notification");
        }

        notification.setRead(true);
        notificationRepository.save(notification);
    }

    private NotificationResponse mapToResponse(Notification notification) {
        User actor = notification.getActor();

        return NotificationResponse.builder()
                .id(notification.getId())
                .type(notification.getType())
                .message(notification.getMessage())
                .isRead(notification.isRead())
                .createdAt(notification.getCreatedAt())
                .actorId(actor != null ? actor.getId() : null)
                .actorFullName(actor != null ? actor.getFullName() : null)
                .actorUsername(actor != null ? actor.getUsername() : null)
                .actorProfilePictureUrl(actor != null ? actor.getProfilePictureUrl() : null)
                .build();
    }
}