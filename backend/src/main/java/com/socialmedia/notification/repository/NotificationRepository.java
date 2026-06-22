package com.socialmedia.notification.repository;

import com.socialmedia.notification.entity.Notification;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    @EntityGraph(attributePaths = {"actor", "recipient"})
    List<Notification> findByRecipientIdOrderByCreatedAtDesc(Long recipientId);

    long countByRecipientIdAndIsReadFalse(Long recipientId);
}