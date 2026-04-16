import { useEffect, useState } from "react";
import api from "../services/api";

function PeoplePage() {
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [followStatus, setFollowStatus] = useState({});

  useEffect(() => {
    fetchCurrentUserAndUsers();
  }, []);

  const fetchCurrentUserAndUsers = async () => {
    try {
      const meRes = await api.get("/api/users/me");
      setCurrentUser(meRes.data);

      const usersToShow = [];
      for (let id = 1; id <= 20; id++) {
        try {
          const res = await api.get(`/api/users/${id}`);
          if (res.data.id !== meRes.data.id) {
            usersToShow.push(res.data);
          }
        } catch (err) {
        }
      }

      setUsers(usersToShow);

      const statusMap = {};
      for (const user of usersToShow) {
        const statusRes = await api.get(`/api/users/${user.id}/is-following`);
        statusMap[user.id] = statusRes.data.following;
      }
      setFollowStatus(statusMap);
    } catch (err) {
      console.error("Failed to fetch people", err);
    }
  };

  const handleFollowToggle = async (userId, isFollowing) => {
    try {
      if (isFollowing) {
        await api.delete(`/api/users/${userId}/follow`);
      } else {
        await api.post(`/api/users/${userId}/follow`);
      }

      setFollowStatus((prev) => ({
        ...prev,
        [userId]: !isFollowing,
      }));
    } catch (err) {
      console.error("Failed to update follow status", err);
    }
  };

  if (!currentUser) {
    return <div style={{ padding: "2rem" }}>Loading people...</div>;
  }

  return (
    <div style={{ padding: "2rem", maxWidth: "700px", margin: "0 auto" }}>
      <h2>People</h2>

      {users.length === 0 ? (
        <p>No users found.</p>
      ) : (
        users.map((user) => (
          <div
            key={user.id}
            style={{
              border: "1px solid #ddd",
              borderRadius: "8px",
              padding: "1rem",
              marginBottom: "1rem",
              backgroundColor: "#fff",
            }}
          >
            <p><strong>{user.fullName}</strong> (@{user.username})</p>
            <p>{user.email}</p>
            <button
              onClick={() => handleFollowToggle(user.id, followStatus[user.id])}
            >
              {followStatus[user.id] ? "Unfollow" : "Follow"}
            </button>
          </div>
        ))
      )}
    </div>
  );
}

export default PeoplePage;