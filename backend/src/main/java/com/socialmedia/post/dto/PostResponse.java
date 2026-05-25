package com.socialmedia.post.dto;

import lombok.Builder;
import lombok.Getter;

import java.io.Serial;
import java.io.Serializable;
import java.time.LocalDateTime;

@Getter
@Builder
public class PostResponse implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private Long id;
    private String content;
    private String imageUrl;

    private Long userId;
    private String username;
    private String fullName;
    private String profilePictureUrl;

    private LocalDateTime createdAt;

    private long likesCount;
    private long commentsCount;
    private long engagementScore;
}