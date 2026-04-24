package com.socialmedia.follow.service;

import com.socialmedia.follow.dto.FollowUserResponse;
import com.socialmedia.follow.entity.Follow;
import com.socialmedia.follow.repository.FollowRepository;
import com.socialmedia.notification.service.NotificationService;
import com.socialmedia.user.entity.User;
import com.socialmedia.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class FollowService {

    private final FollowRepository followRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    @Transactional
    public Map<String, Object> followUser(Long targetUserId, String currentUserEmail) {
        User currentUser = userRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new RuntimeException("Current user not found"));

        User targetUser = userRepository.findById(targetUserId)
                .orElseThrow(() -> new RuntimeException("Target user not found"));

        if (currentUser.getId().equals(targetUser.getId())) {
            throw new RuntimeException("You cannot follow yourself");
        }

        boolean alreadyFollowing = followRepository.existsByFollowerIdAndFollowingId(
                currentUser.getId(),
                targetUserId
        );

        if (alreadyFollowing) {
            return Map.of(
                    "message", "Already following this user",
                    "following", true
            );
        }

        Follow follow = Follow.builder()
                .follower(currentUser)
                .following(targetUser)
                .build();

        followRepository.save(follow);

        notificationService.createNotification(
                targetUser.getId(),
                "FOLLOW",
                currentUser.getUsername() + " started following you"
        );

        return Map.of(
                "message", "User followed successfully",
                "following", true
        );
    }

    @Transactional
    public Map<String, Object> unfollowUser(Long targetUserId, String currentUserEmail) {
        User currentUser = userRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new RuntimeException("Current user not found"));

        boolean alreadyFollowing = followRepository.existsByFollowerIdAndFollowingId(
                currentUser.getId(),
                targetUserId
        );

        if (!alreadyFollowing) {
            return Map.of(
                    "message", "You are not following this user",
                    "following", false
            );
        }

        followRepository.deleteByFollowerIdAndFollowingId(currentUser.getId(), targetUserId);

        return Map.of(
                "message", "User unfollowed successfully",
                "following", false
        );
    }

    public List<FollowUserResponse> getFollowers(Long userId) {
        return followRepository.findByFollowingId(userId)
                .stream()
                .map(follow -> FollowUserResponse.builder()
                        .id(follow.getFollower().getId())
                        .fullName(follow.getFollower().getFullName())
                        .username(follow.getFollower().getUsername())
                        .email(follow.getFollower().getEmail())
                        .build())
                .toList();
    }

    public List<FollowUserResponse> getFollowing(Long userId) {
        return followRepository.findByFollowerId(userId)
                .stream()
                .map(follow -> FollowUserResponse.builder()
                        .id(follow.getFollowing().getId())
                        .fullName(follow.getFollowing().getFullName())
                        .username(follow.getFollowing().getUsername())
                        .email(follow.getFollowing().getEmail())
                        .build())
                .toList();
    }

    public Map<String, Long> getFollowCounts(Long userId) {
        return Map.of(
                "followersCount", followRepository.countByFollowingId(userId),
                "followingCount", followRepository.countByFollowerId(userId)
        );
    }

    public boolean isFollowing(Long currentUserId, Long targetUserId) {
        return followRepository.existsByFollowerIdAndFollowingId(currentUserId, targetUserId);
    }
}