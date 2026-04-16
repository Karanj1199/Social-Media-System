package com.socialmedia.comment.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class CommentResponse {
    private Long id;
    private String content;
    private Long postId;
    private Long userId;
    private String username;
    private String fullName;
    private LocalDateTime createdAt;
}