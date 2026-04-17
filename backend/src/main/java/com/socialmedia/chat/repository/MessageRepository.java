package com.socialmedia.chat.repository;

import com.socialmedia.chat.entity.Message;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MessageRepository extends JpaRepository<Message, Long> {

    List<Message> findBySenderIdAndReceiverIdOrSenderIdAndReceiverIdOrderByCreatedAtAsc(
            Long senderId1,
            Long receiverId1,
            Long senderId2,
            Long receiverId2
    );
}