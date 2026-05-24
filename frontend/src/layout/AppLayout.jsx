import { Link, Outlet, useNavigate } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";

function AppLayout() {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  useEffect(() => {
    document.body.classList.toggle("dark-mode", darkMode);
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

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
          <Link to="/notifications">Notifications</Link>
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
        <Outlet />
      </main>
    </div>
  );
}

export default AppLayout;