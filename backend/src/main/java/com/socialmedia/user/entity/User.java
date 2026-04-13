package com.socialmedia.user.entity;

import com.socialmedia.common.BaseEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import lombok.*;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 80)
    private String fullName;

    @Column(nullable = false, unique = true, length = 80)
    private String username;

    @Email
    @Column(nullable = false, unique = true, length = 120)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(length = 255)
    private String bio;

    @Column(length = 255)
    private String profilePictureUrl;

    @Column(length = 120)
    private String headline;

    @Column(length = 120)
    private String location;

    @Column(nullable = false)
    private boolean enabled = true;
}