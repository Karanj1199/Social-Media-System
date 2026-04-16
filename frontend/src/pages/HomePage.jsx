import { useEffect, useState, useContext } from "react";
import api from "../services/api";
import { AuthContext } from "../context/AuthContext";
import { Link } from "react-router-dom";

function HomePage() {
  const [posts, setPosts] = useState([]);
  const [commentsByPost, setCommentsByPost] = useState({});
  const [commentInputs, setCommentInputs] = useState({});
  const { logout } = useContext(AuthContext);

  useEffect(() => {
    fetchFeed();
  }, []);

  const fetchFeed = async () => {
    try {
      const res = await api.get("/api/posts/feed");
      setPosts(res.data);

      res.data.forEach((post) => {
        fetchComments(post.id);
      });
    } catch (err) {
      console.error("Failed to fetch feed", err);
    }
  };

  const fetchComments = async (postId) => {
    try {
      const res = await api.get(`/api/posts/${postId}/comments`);
      setCommentsByPost((prev) => ({
        ...prev,
        [postId]: res.data,
      }));
    } catch (err) {
      console.error("Failed to fetch comments", err);
    }
  };

  const toggleLike = async (postId) => {
    try {
      await api.post(`/api/posts/${postId}/like`);
      fetchFeed();
    } catch (err) {
      console.error("Failed to like post", err);
    }
  };

  const handleCommentInputChange = (postId, value) => {
    setCommentInputs((prev) => ({
      ...prev,
      [postId]: value,
    }));
  };

  const addComment = async (postId) => {
    const content = commentInputs[postId];
    if (!content || !content.trim()) return;

    try {
      await api.post(`/api/posts/${postId}/comments`, { content });
      setCommentInputs((prev) => ({
        ...prev,
        [postId]: "",
      }));
      fetchComments(postId);
      fetchFeed();
    } catch (err) {
      console.error("Failed to add comment", err);
    }
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "700px", margin: "0 auto" }}>
      <h1>Feed</h1>

      <div style={{ marginBottom: "1rem" }}>
        <Link to="/profile">Go to Profile</Link>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <Link to="/people">Discover People</Link>
      </div>

      <button onClick={logout} style={{ marginBottom: "2rem" }}>
        Logout
      </button>

      {posts.length === 0 ? (
        <p>No posts yet.</p>
      ) : (
        posts.map((post) => (
          <div
            key={post.id}
            style={{
              border: "1px solid #ddd",
              borderRadius: "8px",
              padding: "1rem",
              marginBottom: "1rem",
              backgroundColor: "#fff",
            }}
          >
            <p>
              <strong>{post.fullName}</strong> (@{post.username})
            </p>
            <p>{post.content}</p>
            <small>
              {post.createdAt ? new Date(post.createdAt).toLocaleString() : ""}
            </small>

            <div style={{ marginTop: "1rem" }}>
              <button onClick={() => toggleLike(post.id)}>
                Like ({post.likesCount || 0})
              </button>
            </div>

            <div style={{ marginTop: "1rem" }}>
              <h4>Comments</h4>

              {(commentsByPost[post.id] || []).length === 0 ? (
                <p>No comments yet.</p>
              ) : (
                (commentsByPost[post.id] || []).map((comment) => (
                  <div
                    key={comment.id}
                    style={{
                      borderTop: "1px solid #eee",
                      paddingTop: "0.5rem",
                      marginTop: "0.5rem",
                    }}
                  >
                    <p style={{ margin: 0 }}>
                      <strong>{comment.fullName}</strong> (@{comment.username})
                    </p>
                    <p style={{ margin: "0.25rem 0" }}>{comment.content}</p>
                    <small>
                      {comment.createdAt
                        ? new Date(comment.createdAt).toLocaleString()
                        : ""}
                    </small>
                  </div>
                ))
              )}

              <div style={{ marginTop: "0.75rem" }}>
                <input
                  type="text"
                  placeholder="Write a comment..."
                  value={commentInputs[post.id] || ""}
                  onChange={(e) =>
                    handleCommentInputChange(post.id, e.target.value)
                  }
                  style={{ width: "70%", marginRight: "0.5rem" }}
                />
                <button onClick={() => addComment(post.id)}>Comment</button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default HomePage;