import { Link, Outlet, useNavigate } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import api from "../services/api";

function AppLayout() {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [unreadCount, setUnreadCount] = useState(0);

  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  useEffect(() => {
    document.body.classList.toggle("dark-mode", darkMode);
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  useEffect(() => {
    fetchUnreadCount();
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const res = await api.get("/api/notifications/unread-count");
      setUnreadCount(res.data.count || 0);
    } catch (err) {
      console.error("Failed to fetch unread notifications count", err);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      fetchUnreadCount();
    }
  }, []);

  const handleLogout = () => {
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