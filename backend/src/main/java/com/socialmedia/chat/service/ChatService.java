package com.socialmedia.chat.service;

import com.socialmedia.chat.dto.ChatMessageRequest;
import com.socialmedia.chat.dto.ChatMessageResponse;
import com.socialmedia.chat.entity.Message;
import com.socialmedia.chat.repository.MessageRepository;
import com.socialmedia.user.entity.User;
import com.socialmedia.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final MessageRepository messageRepository;
    private final UserRepository userRepository;

    public ChatMessageResponse saveMessage(String senderEmail, ChatMessageRequest request) {
        User sender = userRepository.findByEmail(senderEmail)
                .orElseThrow(() -> new RuntimeException("Sender not found"));

        User receiver = userRepository.findById(request.getReceiverId())
                .orElseThrow(() -> new RuntimeException("Receiver not found"));

        Message message = Message.builder()
                .content(request.getContent())
                .sender(sender)
                .receiver(receiver)
                .build();

        Message savedMessage = messageRepository.save(message);

        return mapToResponse(savedMessage);
    }

    public List<ChatMessageResponse> getConversation(Long currentUserId, Long otherUserId) {
        return messageRepository
                .findBySenderIdAndReceiverIdOrSenderIdAndReceiverIdOrderByCreatedAtAsc(
                        currentUserId,
                        otherUserId,
                        otherUserId,
                        currentUserId
                )
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    private ChatMessageResponse mapToResponse(Message message) {
        return ChatMessageResponse.builder()
                .id(message.getId())
                .senderId(message.getSender().getId())
                .senderUsername(message.getSender().getUsername())
                .receiverId(message.getReceiver().getId())
                .receiverUsername(message.getReceiver().getUsername())
                .content(message.getContent())
                .createdAt(message.getCreatedAt())
                .build();
    }
}