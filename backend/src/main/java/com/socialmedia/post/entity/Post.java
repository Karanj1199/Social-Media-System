package com.socialmedia.post.entity;

import com.socialmedia.common.BaseEntity;
import com.socialmedia.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "posts", indexes = {
        @Index(name = "idx_post_user", columnList = "user_id"),
        @Index(name = "idx_post_created", columnList = "created_at")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Post extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 2000)
    private String content;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(length = 1000)
    private String imageUrl;
}