package com.socialmedia.comment.repository;

import com.socialmedia.comment.entity.Comment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CommentRepository extends JpaRepository<Comment, Long> {

    @EntityGraph(attributePaths = {"user", "post"})
    Page<Comment> findByPostIdOrderByCreatedAtAsc(
            Long postId,
            Pageable pageable
    );

    long countByPostId(Long postId);
}