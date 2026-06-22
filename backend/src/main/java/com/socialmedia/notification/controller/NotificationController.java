package com.socialmedia.notification.controller;

import com.socialmedia.notification.dto.NotificationResponse;
import com.socialmedia.notification.service.NotificationService;
import com.socialmedia.user.entity.User;
import com.socialmedia.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;
    private final UserRepository userRepository;

    @GetMapping
    public List<NotificationResponse> getNotifications(Authentication authentication) {
        User currentUser = getCurrentUser(authentication);
        return notificationService.getNotifications(currentUser.getId());
    }

    @GetMapping("/unread-count")
    public Map<String, Long> getUnreadCount(Authentication authentication) {
        User currentUser = getCurrentUser(authentication);

        return Map.of(
                "count",
                notificationService.getUnreadCount(currentUser.getId())
        );
    }

    @PutMapping("/{notificationId}/read")
    public Map<String, String> markAsRead(
            @PathVariable Long notificationId,
            Authentication authentication
    ) {
        User currentUser = getCurrentUser(authentication);
        notificationService.markAsRead(notificationId, currentUser.getId());

        return Map.of("message", "Notification marked as read");
    }

    private User getCurrentUser(Authentication authentication) {
        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}