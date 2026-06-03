import { useEffect, useState } from "react";
import api from "../services/api";

function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await api.get("/api/notifications");
      setNotifications(res.data);
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    }
  };

  return (
    <div className="page-container">
      <h1 className="page-title">Notifications</h1>

      {notifications.length === 0 ? (
        <div className="card">
          <p>No notifications yet.</p>
        </div>
      ) : (
        notifications.map((notification) => (
          <div className="card" key={notification.id}>
            <p>
              <strong>{notification.type}</strong>
            </p>

            <p>{notification.message}</p>

            <small className="meta">
              {notification.createdAt
                ? new Date(notification.createdAt).toLocaleString()
                : ""}
            </small>
          </div>
        ))
      )}
    </div>
  );
}

export default NotificationsPage;