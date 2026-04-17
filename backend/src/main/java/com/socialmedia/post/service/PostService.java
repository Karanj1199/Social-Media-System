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
import org.springframework.stereotype.Service;

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

    public List<PostResponse> getPostsByUser(Long userId) {
        return postRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public List<PostResponse> getFeed(String email) {
        User currentUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Long> feedUserIds = new ArrayList<>();

        feedUserIds.add(currentUser.getId());

        followRepository.findByFollowerId(currentUser.getId())
                .forEach(follow -> feedUserIds.add(follow.getFollowing().getId()));

        List<Post> posts;

        if (feedUserIds.size() == 1) {
            posts = postRepository.findAllByOrderByCreatedAtDesc();
        } else {
            posts = postRepository.findByUserIdInOrderByCreatedAtDesc(feedUserIds);
        }

        return posts.stream()
                .map(this::mapToResponse)
                .toList();
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