package com.socialmedia.like.controller;

import com.socialmedia.like.service.LikeService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
public class LikeController {

    private final LikeService likeService;

    @PostMapping("/{postId}/like")
    public Map<String, Object> toggleLike(
            @PathVariable Long postId,
            Authentication authentication
    ) {
        return likeService.toggleLike(postId, authentication.getName());
    }

    @GetMapping("/{postId}/likes/count")
    public Map<String, Long> getLikesCount(@PathVariable Long postId) {
        return Map.of("likesCount", likeService.getLikesCount(postId));
    }
}