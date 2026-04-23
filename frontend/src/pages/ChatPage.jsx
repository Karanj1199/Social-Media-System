import { useContext, useEffect, useRef, useState } from "react";
import SockJS from "sockjs-client/dist/sockjs";
import { Client } from "@stomp/stompjs";
import api from "../services/api";
import { AuthContext } from "../context/AuthContext";

function ChatPage() {
  const { user } = useContext(AuthContext);

  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const stompClientRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchCurrentUserAndUsers();
  }, []);

  useEffect(() => {
    if (currentUser) {
      connectWebSocket();
    }

    return () => {
      if (stompClientRef.current) {
        stompClientRef.current.deactivate();
      }
    };
  }, [currentUser]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchCurrentUserAndUsers = async () => {
    try {
      const meRes = await api.get("/api/users/me");
      setCurrentUser(meRes.data);

      const usersToShow = [];
      for (let id = 1; id <= 5; id++) {
        try {
          const res = await api.get(`/api/users/${id}`);
          if (res.data.id !== meRes.data.id) {
            usersToShow.push(res.data);
          }
        } catch (err) {
        }
      }

      setUsers(usersToShow);
    } catch (err) {
      console.error("Failed to fetch users", err);
    }
  };

  const connectWebSocket = () => {
    const client = new Client({
      webSocketFactory: () => new SockJS("http://localhost:8080/ws-chat"),
      reconnectDelay: 5000,
      debug: (str) => {
        console.log(str);
      },
      onConnect: () => {
        console.log("Connected to WebSocket");

        client.subscribe(`/user/${currentUser.id}/queue/messages`, (message) => {
          const receivedMessage = JSON.parse(message.body);

          setMessages((prev) => {
            if (
              selectedUser &&
              (receivedMessage.senderId === selectedUser.id ||
                receivedMessage.receiverId === selectedUser.id)
            ) {
              return [...prev, receivedMessage];
            }
            return prev;
          });
        });
      },
      onStompError: (frame) => {
        console.error("Broker error:", frame);
      },
    });

    client.activate();
    stompClientRef.current = client;
  };

  const loadConversation = async (otherUser) => {
    try {
      setSelectedUser(otherUser);
      const res = await api.get(`/api/messages/conversation/${otherUser.id}`);
      setMessages(res.data);
    } catch (err) {
      console.error("Failed to load conversation", err);
    }
  };

//   const sendMessage = async () => {
//     if (!messageInput.trim() || !selectedUser || !stompClientRef.current) return;
//
//     const payload = {
//       receiverId: selectedUser.id,
//       content: messageInput,
//     };
//
//     stompClientRef.current.publish({
//       destination: "/app/chat.send",
//       body: JSON.stringify(payload),
//     });
//
//     setMessageInput("");
//   };

const sendMessage = async () => {
  if (!messageInput.trim() || !selectedUser) return;

  try {
    const res = await api.post("/api/messages", {
      receiverId: selectedUser.id,
      content: messageInput,
    });

    setMessages((prev) => [...prev, res.data]);
    setMessageInput("");
  } catch (err) {
    console.error("Failed to send message", err);
  }
};

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  if (!currentUser) {
    return <div style={{ padding: "2rem" }}>Loading chat...</div>;
  }

  return (
    <div
      style={{
        display: "flex",
        height: "calc(100vh - 40px)",
        padding: "1rem",
        gap: "1rem",
      }}
    >
      <div
        style={{
          width: "30%",
          border: "1px solid #ddd",
          borderRadius: "8px",
          padding: "1rem",
          backgroundColor: "#fff",
          overflowY: "auto",
        }}
      >
        <h3>Chats</h3>

        {users.length === 0 ? (
          <p>No users available.</p>
        ) : (
          users.map((chatUser) => (
            <div
              key={chatUser.id}
              onClick={() => loadConversation(chatUser)}
              style={{
                padding: "0.75rem",
                borderBottom: "1px solid #eee",
                cursor: "pointer",
                backgroundColor:
                  selectedUser?.id === chatUser.id ? "#f5f5f5" : "transparent",
              }}
            >
              <strong>{chatUser.fullName}</strong>
              <p style={{ margin: 0 }}>@{chatUser.username}</p>
            </div>
          ))
        )}
      </div>

      <div
        style={{
          width: "70%",
          border: "1px solid #ddd",
          borderRadius: "8px",
          padding: "1rem",
          backgroundColor: "#fff",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {selectedUser ? (
          <>
            <h3>
              Chat with {selectedUser.fullName} (@{selectedUser.username})
            </h3>

            <div
              style={{
                flex: 1,
                overflowY: "auto",
                border: "1px solid #eee",
                padding: "1rem",
                marginBottom: "1rem",
                borderRadius: "8px",
                backgroundColor: "#fafafa",
              }}
            >
              {messages.length === 0 ? (
                <p>No messages yet.</p>
              ) : (
                messages.map((msg) => {
                  const isMine = msg.senderId === currentUser.id;

                  return (
                    <div
                      key={msg.id ?? `${msg.senderId}-${msg.receiverId}-${msg.createdAt}-${msg.content}`}
                      style={{
                        textAlign: isMine ? "right" : "left",
                        marginBottom: "1rem",
                      }}
                    >
                      <div
                        style={{
                          display: "inline-block",
                          padding: "0.75rem",
                          borderRadius: "12px",
                          backgroundColor: isMine ? "#dbeafe" : "#eee",
                          maxWidth: "70%",
                        }}
                      >
                        <p style={{ margin: 0 }}>{msg.content}</p>
                      </div>
                      <div>
                        <small>
                          {msg.createdAt
                            ? new Date(msg.createdAt).toLocaleString()
                            : ""}
                        </small>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            <div style={{ display: "flex", gap: "0.5rem" }}>
              <input
                type="text"
                placeholder="Type a message..."
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                style={{ flex: 1, padding: "0.75rem" }}
              />
              <button onClick={sendMessage}>Send</button>
            </div>
          </>
        ) : (
          <div style={{ margin: "auto", textAlign: "center" }}>
            <h3>Select a user to start chatting</h3>
          </div>
        )}
      </div>
    </div>
  );
}

export default ChatPage;