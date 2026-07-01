import { Link, Outlet, useNavigate } from "react-router-dom";
import { useContext, useEffect, useRef, useState } from "react";
import SockJS from "sockjs-client/dist/sockjs";
import { Client } from "@stomp/stompjs";
import { AuthContext } from "../context/AuthContext";
import api from "../services/api";

function AppLayout() {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [unreadCount, setUnreadCount] = useState(0);
  const stompClientRef = useRef(null);
  const subscriptionRef = useRef(null);

  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  useEffect(() => {
    document.body.classList.toggle("dark-mode", darkMode);
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      initializeNotifications();
    }

    return () => {
      subscriptionRef.current?.unsubscribe();
      stompClientRef.current?.deactivate();
    };
  }, []);

  const initializeNotifications = async () => {
    try {
      await fetchUnreadCount();

      const meRes = await api.get("/api/users/me");
      connectNotificationSocket(meRes.data.id);
    } catch (err) {
      console.error("Failed to initialize notifications", err);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const res = await api.get("/api/notifications/unread-count");
      setUnreadCount(res.data.count || 0);
    } catch (err) {
      console.error("Failed to fetch unread notifications count", err);
    }
  };

  const connectNotificationSocket = (userId) => {
    const client = new Client({
      webSocketFactory: () => new SockJS("/ws-chat"),
      reconnectDelay: 5000,
onConnect: () => {
  console.log("Connected to notification WebSocket");
    console.log("Subscribing to notifications for user:", userId);
  subscriptionRef.current = client.subscribe(
    `/topic/notifications/${userId}`,
    (message) => {
      console.log("New notification received:", message.body);

      setTimeout(() => {
        fetchUnreadCount();
      }, 300);
    }
  );
},
      onStompError: (frame) => {
        console.error("Notification WebSocket error:", frame);
      },
    });

    client.activate();
    stompClientRef.current = client;
  };

  const handleLogout = () => {
    subscriptionRef.current?.unsubscribe();
    stompClientRef.current?.deactivate();
    logout();
    navigate("/login");
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <h2 className="logo">SocialSphere</h2>

        <nav>
          <Link to="/">Feed</Link>
          <Link to="/profile">Profile</Link>
          <Link to="/people">People</Link>
          <Link to="/chat">Chat</Link>

          <Link to="/notifications" style={{ position: "relative" }}>
            Notifications
            {unreadCount > 0 && (
              <span
                style={{
                  marginLeft: "8px",
                  backgroundColor: "#ef4444",
                  color: "#fff",
                  borderRadius: "999px",
                  padding: "2px 7px",
                  fontSize: "12px",
                  fontWeight: "bold",
                }}
              >
                {unreadCount}
              </span>
            )}
          </Link>

          <Link to="/search">Search</Link>
          <Link to="/trending">Trending</Link>
          <Link to="/recommendations">Recommendations</Link>
        </nav>

        <button
          className="theme-btn"
          onClick={() => setDarkMode((prev) => !prev)}
        >
          {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
        </button>

        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </aside>

      <main className="main-content">
        <Outlet context={{ refreshUnreadCount: fetchUnreadCount }} />
      </main>
    </div>
  );
}

export default AppLayout;