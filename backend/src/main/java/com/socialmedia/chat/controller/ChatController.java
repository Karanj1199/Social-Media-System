package com.socialmedia.chat.controller;

import com.socialmedia.chat.dto.ChatMessageRequest;
import com.socialmedia.chat.dto.ChatMessageResponse;
import com.socialmedia.chat.service.ChatService;
import com.socialmedia.user.entity.User;
import com.socialmedia.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/messages")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @GetMapping("/conversation/{userId}")
    public List<ChatMessageResponse> getConversation(
            @PathVariable Long userId,
            Authentication authentication
    ) {
        User currentUser = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("Current user not found"));

        return chatService.getConversation(currentUser.getId(), userId);
    }

    @PostMapping
    public ChatMessageResponse sendMessageRest(
            @RequestBody ChatMessageRequest request,
            Authentication authentication
    ) {
        return chatService.saveMessage(authentication.getName(), request);
    }

    @MessageMapping("/chat.send")
    public void sendMessage(ChatMessageRequest request, Principal principal) {
        ChatMessageResponse savedMessage = chatService.saveMessage(principal.getName(), request);

        messagingTemplate.convertAndSendToUser(
                String.valueOf(savedMessage.getReceiverId()),
                "/queue/messages",
                savedMessage
        );

        messagingTemplate.convertAndSendToUser(
                String.valueOf(savedMessage.getSenderId()),
                "/queue/messages",
                savedMessage
        );
    }
}