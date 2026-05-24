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
    <div className="page-container">
      <h1 className="page-title">Trending Posts</h1>

      {posts.length === 0 ? (
        <div className="card">
          <p>No trending posts.</p>
        </div>
      ) : (
        posts.map((post) => (
          <div className="card" key={post.id}>
            <p>
              <strong>{post.fullName}</strong>{" "}
              <span className="meta">@{post.username}</span>
            </p>

            <p>{post.content}</p>

            {post.imageUrl && (
              <img
                src={`http://localhost:8080${post.imageUrl}`}
                alt="Post"
                className="post-image"
              />
            )}

            <p className="meta">Likes: {post.likesCount}</p>
            <p className="meta">Comments: {post.commentsCount}</p>
            <p className="meta">Engagement Score: {post.engagementScore}</p>
          </div>
        ))
      )}
    </div>
  );
}

export default TrendingPage;