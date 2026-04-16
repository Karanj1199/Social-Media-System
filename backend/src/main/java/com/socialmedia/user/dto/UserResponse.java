package com.socialmedia.user.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class UserResponse {
    private Long id;
    private String fullName;
    private String username;
    private String email;
    private String bio;
    private String profilePictureUrl;
    private String headline;
    private String location;
}