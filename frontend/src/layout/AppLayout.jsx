import { Link, Outlet, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

function AppLayout() {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

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