package com.socialmedia.post.service;

import com.socialmedia.post.dto.CreatePostRequest;
import com.socialmedia.post.dto.PostResponse;
import com.socialmedia.post.entity.Post;
import com.socialmedia.post.repository.PostRepository;
import com.socialmedia.user.entity.User;
import com.socialmedia.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PostService {

    private final PostRepository postRepository;
    private final UserRepository userRepository;

    public PostResponse createPost(String email, CreatePostRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Post post = Post.builder()
                .content(request.getContent())
                .user(user)
                .build();

        Post savedPost = postRepository.save(post);
        return mapToResponse(savedPost);
    }

    public List<PostResponse> getPostsByUser(Long userId) {
        return postRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    private PostResponse mapToResponse(Post post) {
        return PostResponse.builder()
                .id(post.getId())
                .content(post.getContent())
                .userId(post.getUser().getId())
                .username(post.getUser().getUsername())
                .fullName(post.getUser().getFullName())
                .createdAt(post.getCreatedAt())
                .build();
    }
}