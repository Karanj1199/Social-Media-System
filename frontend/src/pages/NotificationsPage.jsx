import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../services/api";

function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const outletContext = useOutletContext();
  const refreshUnreadCount = outletContext?.refreshUnreadCount;

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await api.get("/api/notifications");
      setNotifications(res.data);
    } catch (err) {
      console.error("Failed to fetch notifications", err);
      toast.error("Failed to load notifications");
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await api.put(`/api/notifications/${notificationId}/read`);

      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === notificationId
            ? { ...notification, read: true }
            : notification
        )
      );

      refreshUnreadCount?.();
    } catch (err) {
      console.error("Failed to mark notification as read", err);
      toast.error("Failed to mark notification as read");
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
          <div
            className="card"
            key={notification.id}
            style={{
              borderLeft: notification.read
                ? "4px solid transparent"
                : "4px solid #ef4444",
            }}
          >
            <p>
              <strong>{notification.type}</strong>
              {!notification.read && (
                <span className="meta" style={{ marginLeft: "8px" }}>
                  New
                </span>
              )}
            </p>

            <p>{notification.message}</p>

            {notification.actorUsername && (
              <p className="meta">@{notification.actorUsername}</p>
            )}

            <small className="meta">
              {notification.createdAt
                ? new Date(notification.createdAt).toLocaleString()
                : ""}
            </small>

            {!notification.read && (
              <div style={{ marginTop: "12px" }}>
                <button onClick={() => markAsRead(notification.id)}>
                  Mark as read
                </button>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}

export default NotificationsPage;