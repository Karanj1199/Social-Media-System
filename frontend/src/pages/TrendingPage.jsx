import { useEffect, useState } from "react";
import api from "../services/api";

function TrendingPage() {

  const [posts, setPosts] = useState([]);

  useEffect(() => {
    fetchTrendingPosts();
  }, []);

  const fetchTrendingPosts = async () => {
    try {
      const res = await api.get("/api/posts/trending");
      setPosts(res.data);
    } catch (err) {
      console.error("Failed to fetch trending posts", err);
    }
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "700px", margin: "0 auto" }}>
      <h2>Trending Posts</h2>

      {posts.length === 0 ? (
        <p>No trending posts.</p>
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

            <div style={{ marginTop: "1rem" }}>
              <small>Likes: {post.likesCount}</small>
            </div>

            <div>
              <small>Comments: {post.commentsCount}</small>
            </div>

            <div>
              <small>
                Engagement Score: {post.engagementScore}
              </small>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default TrendingPage;