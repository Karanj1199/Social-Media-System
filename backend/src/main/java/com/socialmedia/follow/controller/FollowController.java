package com.socialmedia.follow.controller;

import com.socialmedia.follow.dto.FollowUserResponse;
import com.socialmedia.follow.service.FollowService;
import com.socialmedia.user.entity.User;
import com.socialmedia.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class FollowController {

    private final FollowService followService;
    private final UserRepository userRepository;

    @PostMapping("/{id}/follow")
    public Map<String, Object> followUser(
            @PathVariable Long id,
            Authentication authentication
    ) {
        return followService.followUser(id, authentication.getName());
    }

    @DeleteMapping("/{id}/follow")
    public Map<String, Object> unfollowUser(
            @PathVariable Long id,
            Authentication authentication
    ) {
        return followService.unfollowUser(id, authentication.getName());
    }

    @GetMapping("/{id}/followers")
    public List<FollowUserResponse> getFollowers(@PathVariable Long id) {
        return followService.getFollowers(id);
    }

    @GetMapping("/{id}/following")
    public List<FollowUserResponse> getFollowing(@PathVariable Long id) {
        return followService.getFollowing(id);
    }

    @GetMapping("/{id}/follow-counts")
    public Map<String, Long> getFollowCounts(@PathVariable Long id) {
        return followService.getFollowCounts(id);
    }

    @GetMapping("/{id}/is-following")
    public Map<String, Boolean> isFollowing(
            @PathVariable Long id,
            Authentication authentication
    ) {
        User currentUser = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("Current user not found"));

        return Map.of(
                "following",
                followService.isFollowing(currentUser.getId(), id)
        );
    }
}