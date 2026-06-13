import { useEffect, useState } from "react";
import api from "../services/api";

function RecommendationsPage() {

  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      const res = await api.get("/api/users/recommended");
      setUsers(res.data);
    } catch (err) {
      console.error("Failed to fetch recommendations", err);
    }
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "700px", margin: "0 auto" }}>
      <h2>Recommended Users</h2>

      {users.length === 0 ? (
        <p>No recommendations.</p>
      ) : (
        users.map((user) => (
          <div
            key={user.id}
            style={{
              border: "1px solid var(--border-color)",
              borderRadius: "12px",
              padding: "1rem",
              marginBottom: "1rem",
              backgroundColor: "var(--card-bg)",
              color: "var(--text-primary)",
            }}
          >
            <p>
              <strong>{user.fullName}</strong> (@{user.username})
            </p>

            <p>{user.bio || "No bio yet"}</p>
          </div>
        ))
      )}
    </div>
  );
}

export default RecommendationsPage;