package com.socialmedia.post.service;

import com.socialmedia.follow.repository.FollowRepository;
import com.socialmedia.like.repository.PostLikeRepository;
import com.socialmedia.post.dto.CreatePostRequest;
import com.socialmedia.post.dto.PostResponse;
import com.socialmedia.post.entity.Post;
import com.socialmedia.post.repository.PostRepository;
import com.socialmedia.user.entity.User;
import com.socialmedia.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PostService {

    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final PostLikeRepository postLikeRepository;
    private final FollowRepository followRepository;

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

    @Transactional(readOnly = true)
    public Page<PostResponse> getPostsByUser(Long userId, int page, int size) {
        return postRepository.findByUserId(userId, PageRequest.of(page, size))
                .map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public Page<PostResponse> getFeed(String email, int page, int size) {
        User currentUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Long> feedUserIds = new ArrayList<>();
        feedUserIds.add(currentUser.getId());

        followRepository.findByFollowerId(currentUser.getId())
                .forEach(follow -> feedUserIds.add(follow.getFollowing().getId()));

        Pageable pageable = PageRequest.of(page, size);

        Page<Post> posts;

        if (feedUserIds.size() == 1) {
            posts = postRepository.findAll(pageable);
        } else {
            posts = postRepository.findByUserIdIn(feedUserIds, pageable);
        }

        return posts.map(this::mapToResponse);
    }

    private PostResponse mapToResponse(Post post) {
        long likesCount = postLikeRepository.countByPostId(post.getId());

        return PostResponse.builder()
                .id(post.getId())
                .content(post.getContent())
                .userId(post.getUser().getId())
                .username(post.getUser().getUsername())
                .fullName(post.getUser().getFullName())
                .createdAt(post.getCreatedAt())
                .likesCount(likesCount)
                .build();
    }
}