import { useEffect, useState } from "react";
import toast from "react-hot-toast";
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

      for (let id = 1; id <= 10; id++) {
        try {
          const res = await api.get(`/api/users/${id}`);
          if (res.data.id !== meRes.data.id) {
            usersToShow.push(res.data);
          }
        } catch {}
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
      toast.error("Failed to load people");
    }
  };

  const handleFollowToggle = async (userId, isFollowing) => {
    try {
      if (isFollowing) {
        await api.delete(`/api/users/${userId}/follow`);
        toast.success("User unfollowed");
      } else {
        await api.post(`/api/users/${userId}/follow`);
        toast.success("User followed");
      }

      setFollowStatus((prev) => ({
        ...prev,
        [userId]: !isFollowing,
      }));
    } catch (err) {
      console.error("Failed to update follow status", err);
      toast.error("Failed to update follow status");
    }
  };

  if (!currentUser) {
    return <div className="page-container">Loading people...</div>;
  }

  return (
    <div className="page-container">
      <h1 className="page-title">People</h1>

      {users.length === 0 ? (
        <div className="card">
          <p>No users found.</p>
        </div>
      ) : (
        users.map((user) => (
          <div className="card" key={user.id}>
            <p>
              <strong>{user.fullName}</strong>{" "}
              <span className="meta">@{user.username}</span>
            </p>

            <p className="meta">{user.email}</p>

            <button
              onClick={() =>
                handleFollowToggle(user.id, followStatus[user.id])
              }
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