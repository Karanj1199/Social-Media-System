package com.socialmedia.follow.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class FollowUserResponse {
    private Long id;
    private String fullName;
    private String username;
    private String email;
}