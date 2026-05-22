package com.socialmedia.comment.controller;

import com.socialmedia.comment.dto.CommentRequest;
import com.socialmedia.comment.dto.CommentResponse;
import com.socialmedia.comment.service.CommentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
public class CommentController {

    private final CommentService commentService;

    @PostMapping("/{postId}/comments")
    public CommentResponse addComment(
            @PathVariable Long postId,
            Authentication authentication,
            @Valid @RequestBody CommentRequest request
    ) {
        return commentService.addComment(postId, authentication.getName(), request);
    }

    @GetMapping("/{postId}/comments")
    public Page<CommentResponse> getComments(
            @PathVariable Long postId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size
    ) {
        return commentService.getCommentsByPost(postId, page, size);
    }
}