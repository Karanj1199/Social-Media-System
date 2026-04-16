package com.socialmedia.post.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class PostResponse {
    private Long id;
    private String content;
    private Long userId;
    private String username;
    private String fullName;
    private LocalDateTime createdAt;
}