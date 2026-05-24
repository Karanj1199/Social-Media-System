import { useEffect, useRef, useState } from "react";
import SockJS from "sockjs-client/dist/sockjs";
import { Client } from "@stomp/stompjs";
import api from "../services/api";

function ChatPage() {
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");

  const stompClientRef = useRef(null);
  const messagesEndRef = useRef(null);
  const subscriptionRef = useRef(null);

  useEffect(() => {
    fetchCurrentUserAndUsers();
  }, []);

  useEffect(() => {
    if (currentUser) connectWebSocket();

    return () => {
      subscriptionRef.current?.unsubscribe();
      stompClientRef.current?.deactivate();
    };
  }, [currentUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchCurrentUserAndUsers = async () => {
    const meRes = await api.get("/api/users/me");
    setCurrentUser(meRes.data);

    const usersToShow = [];

    for (let id = 1; id <= 5; id++) {
      try {
        const res = await api.get(`/api/users/${id}`);
        if (res.data.id !== meRes.data.id) usersToShow.push(res.data);
      } catch {}
    }

    setUsers(usersToShow);
  };

  const connectWebSocket = () => {
    const client = new Client({
      webSocketFactory: () => new SockJS("http://localhost:8080/ws-chat"),
      reconnectDelay: 5000,
      onConnect: () => console.log("Connected to WebSocket"),
      onStompError: (frame) => console.error("Broker error:", frame),
    });

    client.activate();
    stompClientRef.current = client;
  };

  const getRoomId = (user1, user2) => {
    return user1 < user2 ? `${user1}-${user2}` : `${user2}-${user1}`;
  };

  const loadConversation = async (otherUser) => {
    try {
      setSelectedUser(otherUser);

      const res = await api.get(`/api/messages/conversation/${otherUser.id}`);
      setMessages(res.data);

      subscriptionRef.current?.unsubscribe();

      const roomId = getRoomId(currentUser.id, otherUser.id);

      if (stompClientRef.current?.connected) {
        subscriptionRef.current = stompClientRef.current.subscribe(
          `/topic/conversation/${roomId}`,
          (message) => {
            const receivedMessage = JSON.parse(message.body);

            setMessages((prev) => {
              const exists = prev.some((msg) => msg.id === receivedMessage.id);
              if (exists) return prev;
              return [...prev, receivedMessage];
            });
          }
        );
      }
    } catch (err) {
      console.error("Failed to load conversation", err);
    }
  };

const sendMessage = async () => {
  if (!messageInput.trim() || !selectedUser) {
    toast.error("Message cannot be empty");
    return;
  }

  try {
    const res = await api.post("/api/messages", {
      receiverId: selectedUser.id,
      content: messageInput,
    });

    setMessages((prev) => [...prev, res.data]);
    setMessageInput("");
  } catch (err) {
    console.error("Failed to send message", err);
    toast.error("Failed to send message");
  }
};

  if (!currentUser) return <div className="page-container">Loading chat...</div>;

  return (
    <div className="chat-layout">
      <aside className="chat-sidebar">
        <h2>Messages</h2>

        {users.map((user) => (
          <div
            key={user.id}
            className={`chat-user ${selectedUser?.id === user.id ? "active" : ""}`}
            onClick={() => loadConversation(user)}
          >
            <strong>{user.fullName}</strong>
            <p className="meta">@{user.username}</p>
          </div>
        ))}
      </aside>

      <section className="chat-window">
        {selectedUser ? (
          <>
            <div className="chat-header">
              <strong>{selectedUser.fullName}</strong>
              <p className="meta">@{selectedUser.username}</p>
            </div>

            <div className="chat-body">
              {messages.map((msg, index) => {
                const isMine = msg.senderId === currentUser.id;

                return (
                  <div
                    key={msg.id ?? index}
                    className={`message-row ${isMine ? "mine" : ""}`}
                  >
                    <div className="message-bubble">
                      <p style={{ margin: 0 }}>{msg.content}</p>
                      <small>
                        {msg.createdAt
                          ? new Date(msg.createdAt).toLocaleTimeString()
                          : ""}
                      </small>
                    </div>
                  </div>
                );
              })}

              <div ref={messagesEndRef} />
            </div>

            <div className="chat-input-area">
              <input
                placeholder="Type a message..."
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") sendMessage();
                }}
              />
              <button onClick={sendMessage}>Send</button>
            </div>
          </>
        ) : (
          <div className="empty-chat">
            <h2>Select a conversation</h2>
            <p>Choose a user from the left to start chatting.</p>
          </div>
        )}
      </section>
    </div>
  );
}

export default ChatPage;