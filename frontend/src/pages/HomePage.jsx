import { useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

function HomePage() {
  const { user, logout } = useContext(AuthContext);

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Home</h1>
      <p>Logged in successfully</p>

      <div style={{ marginBottom: "1rem" }}>
        <Link to="/profile">Go to Profile</Link>
      </div>

      <button onClick={logout}>Logout</button>
    </div>
  );
}

export default HomePage;