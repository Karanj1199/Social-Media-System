import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import SockJS from "sockjs-client/dist/sockjs";
import { Client } from "@stomp/stompjs";
import toast from "react-hot-toast";
import api from "../services/api";

function ChatPage() {
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const [socketConnected, setSocketConnected] = useState(false);

  const stompClientRef = useRef(null);
  const messagesEndRef = useRef(null);
  const subscriptionRef = useRef(null);
  const autoOpenedRef = useRef(false);

  const [searchParams] = useSearchParams();
  const targetUserId = searchParams.get("userId");

  useEffect(() => {
    fetchCurrentUserAndUsers();
  }, []);

  useEffect(() => {
    if (currentUser) {
      connectWebSocket();
    }

    return () => {
      subscriptionRef.current?.unsubscribe();
      stompClientRef.current?.deactivate();
    };
  }, [currentUser]);

  useEffect(() => {
    if (
      !targetUserId ||
      !currentUser ||
      users.length === 0 ||
      autoOpenedRef.current
    ) {
      return;
    }

    const targetUser = users.find(
      (user) => user.id === Number(targetUserId)
    );

    if (targetUser) {
      autoOpenedRef.current = true;
      loadConversation(targetUser);
    }
  }, [targetUserId, currentUser, users, socketConnected]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  const fetchCurrentUserAndUsers = async () => {
    try {
      const meRes = await api.get("/api/users/me");
      setCurrentUser(meRes.data);

      const usersRes = await api.get("/api/users");
      setUsers(usersRes.data);
    } catch (err) {
      console.error("Failed to fetch users", err);
      toast.error("Failed to load chat users");
    }
  };

  const connectWebSocket = () => {
    const client = new Client({
      webSocketFactory: () => new SockJS("/ws-chat"),

      reconnectDelay: 5000,

      onConnect: () => {
        console.log("Connected to WebSocket");
        setSocketConnected(true);
      },

      onDisconnect: () => {
        setSocketConnected(false);
      },

      onStompError: (frame) => {
        console.error("Broker error:", frame);
      },
    });

    client.activate();
    stompClientRef.current = client;
  };

  const getRoomId = (user1, user2) => {
    return user1 < user2
      ? `${user1}-${user2}`
      : `${user2}-${user1}`;
  };

  const subscribeToConversation = (otherUser) => {
    if (
      !currentUser ||
      !stompClientRef.current?.connected
    ) {
      return;
    }

    subscriptionRef.current?.unsubscribe();

    const roomId = getRoomId(
      currentUser.id,
      otherUser.id
    );

    subscriptionRef.current =
      stompClientRef.current.subscribe(
        `/topic/conversation/${roomId}`,
        (message) => {
          const receivedMessage = JSON.parse(
            message.body
          );

          setMessages((prev) => {
            const exists = prev.some(
              (msg) => msg.id === receivedMessage.id
            );

            if (exists) {
              return prev;
            }

            return [...prev, receivedMessage];
          });
        }
      );
  };

  const loadConversation = async (otherUser) => {
    try {
      setSelectedUser(otherUser);

      const res = await api.get(
        `/api/messages/conversation/${otherUser.id}`
      );

      setMessages(res.data);

      subscribeToConversation(otherUser);
    } catch (err) {
      console.error(
        "Failed to load conversation",
        err
      );

      toast.error("Failed to load conversation");
    }
  };

  useEffect(() => {
    if (selectedUser && socketConnected) {
      subscribeToConversation(selectedUser);
    }
  }, [socketConnected, selectedUser]);

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

      setMessages((prev) => {
        const exists = prev.some(
          (msg) => msg.id === res.data.id
        );

        if (exists) {
          return prev;
        }

        return [...prev, res.data];
      });

      setMessageInput("");
    } catch (err) {
      console.error("Failed to send message", err);
      toast.error("Failed to send message");
    }
  };

  if (!currentUser) {
    return (
      <div className="page-container">
        Loading chat...
      </div>
    );
  }

  return (
    <div className="chat-layout">
      <aside className="chat-sidebar">
        <h2>Messages</h2>

        {users.map((user) => (
          <div
            key={user.id}
            className={`chat-user ${
              selectedUser?.id === user.id
                ? "active"
                : ""
            }`}
            onClick={() => loadConversation(user)}
          >
            <strong
              style={{ cursor: "pointer" }}
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/profile/${user.id}`);
              }}
            >
              {user.fullName}
            </strong>

            <p className="meta">
              @{user.username}
            </p>
          </div>
        ))}
      </aside>

      <section className="chat-window">
        {selectedUser ? (
          <>
            <div className="chat-header">
              <strong
                style={{ cursor: "pointer" }}
                onClick={() =>
                  navigate(
                    `/profile/${selectedUser.id}`
                  )
                }
              >
                {selectedUser.fullName}
              </strong>

              <p className="meta">
                @{selectedUser.username}
              </p>
            </div>

            <div className="chat-body">
              {messages.map((msg, index) => {
                const isMine =
                  msg.senderId === currentUser.id;

                return (
                  <div
                    key={msg.id ?? index}
                    className={`message-row ${
                      isMine ? "mine" : ""
                    }`}
                  >
                    <div className="message-bubble">
                      <p style={{ margin: 0 }}>
                        {msg.content}
                      </p>

                      <small>
                        {msg.createdAt
                          ? new Date(
                              msg.createdAt
                            ).toLocaleTimeString()
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
                onChange={(e) =>
                  setMessageInput(e.target.value)
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    sendMessage();
                  }
                }}
              />

              <button onClick={sendMessage}>
                Send
              </button>
            </div>
          </>
        ) : (
          <div className="empty-chat">
            <h2>Select a conversation</h2>
            <p>
              Choose a user from the left to start
              chatting.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

export default ChatPage;