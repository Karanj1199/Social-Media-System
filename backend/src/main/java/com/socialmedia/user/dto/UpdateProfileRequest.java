package com.socialmedia.user.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateProfileRequest {
    private String fullName;
    private String bio;
    private String profilePictureUrl;
    private String headline;
    private String location;
}