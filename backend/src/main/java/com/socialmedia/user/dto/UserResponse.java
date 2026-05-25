package com.socialmedia.user.dto;

import lombok.Builder;
import lombok.Getter;

import java.io.Serial;
import java.io.Serializable;

@Getter
@Builder
public class UserResponse implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private Long id;
    private String fullName;
    private String username;
    private String email;
    private String bio;
    private String profilePictureUrl;
    private String headline;
    private String location;
}