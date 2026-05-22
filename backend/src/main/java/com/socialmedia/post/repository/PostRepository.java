package com.socialmedia.post.repository;

import com.socialmedia.post.entity.Post;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface PostRepository extends JpaRepository<Post, Long> {

    Page<Post> findByUserId(Long userId, Pageable pageable);

    Page<Post> findByUserIdIn(List<Long> userIds, Pageable pageable);

    Page<Post> findAll(Pageable pageable);

    @Query("""
        SELECT p FROM Post p
        JOIN FETCH p.user
        WHERE p.user.id IN :userIds
    """)
    Page<Post> findFeedWithUser(List<Long> userIds, Pageable pageable);
}