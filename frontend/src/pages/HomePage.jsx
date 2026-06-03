import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import api from "../services/api";

function HomePage() {
  const [currentUser, setCurrentUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [commentsByPost, setCommentsByPost] = useState({});
  const [commentInputs, setCommentInputs] = useState({});
  const [postContent, setPostContent] = useState("");
  const [postImageUrl, setPostImageUrl] = useState("");
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const observer = useRef();

  useEffect(() => {
    fetchCurrentUser();
    fetchFeed(0);
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const res = await api.get("/api/users/me");
      setCurrentUser(res.data);
    } catch (err) {
      console.error("Failed to fetch current user", err);
    }
  };

  const getInitials = (name) => {
    if (!name) return "U";

    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  const fetchFeed = async (pageNumber = 0) => {
    try {
      const res = await api.get(`/api/posts/feed?page=${pageNumber}&size=5`);

      if (pageNumber === 0) {
        setPosts(res.data.content);
      } else {
        setPosts((prev) => {
          const existingIds = new Set(prev.map((post) => post.id));

          const newPosts = res.data.content.filter(
            (post) => !existingIds.has(post.id)
          );

          return [...prev, ...newPosts];
        });
      }

      setHasMore(!res.data.last);

      res.data.content.forEach((post) => {
        fetchComments(post.id);
      });
    } catch (err) {
      console.error("Failed to fetch feed", err);
      toast.error("Failed to fetch feed");
    }
  };

  const createPost = async (e) => {
    e.preventDefault();

    if (!postContent.trim() && !postImageUrl) {
      toast.error("Post cannot be empty");
      return;
    }

    try {
      await api.post("/api/posts", {
        content: postContent,
        imageUrl: postImageUrl,
      });

      toast.success("Post created successfully");

      setPostContent("");
      setPostImageUrl("");
      setPage(0);
      fetchFeed(0);
    } catch (err) {
      console.error("Failed to create post", err);
      toast.error("Failed to create post");
    }
  };

  const uploadPostImage = async (e) => {
    const file = e.target.files[0];

    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await api.post("/api/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setPostImageUrl(res.data);
      toast.success("Image uploaded");
    } catch (err) {
      console.error("Failed to upload image", err);
      toast.error("Failed to upload image");
    }
  };

  const fetchComments = async (postId) => {
    try {
      const res = await api.get(`/api/posts/${postId}/comments?page=0&size=5`);

      setCommentsByPost((prev) => ({
        ...prev,
        [postId]: res.data.content,
      }));
    } catch (err) {
      console.error("Failed to fetch comments", err);
    }
  };

  const toggleLike = async (postId) => {
    try {
      await api.post(`/api/posts/${postId}/like`);
      setPage(0);
      fetchFeed(0);
    } catch (err) {
      console.error("Failed to like/unlike post", err);
      toast.error("Failed to update like");
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

    if (!content || !content.trim()) {
      toast.error("Comment cannot be empty");
      return;
    }

    try {
      await api.post(`/api/posts/${postId}/comments`, { content });

      setCommentInputs((prev) => ({
        ...prev,
        [postId]: "",
      }));

      toast.success("Comment added");

      fetchComments(postId);
      setPage(0);
      fetchFeed(0);
    } catch (err) {
      console.error("Failed to add comment", err);
      toast.error("Failed to add comment");
    }
  };

  const lastPostRef = useCallback(
    (node) => {
      if (!hasMore) return;

      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          const nextPage = page + 1;
          setPage(nextPage);
          fetchFeed(nextPage);
        }
      });

      if (node) observer.current.observe(node);
    },
    [hasMore, page]
  );

  return (
    <div className="page-container">
      <h1 className="page-title">Home Feed</h1>

      <div className="feed-composer">
        <form onSubmit={createPost}>
          <div className="composer-header">
            <div className="small-avatar">
              {currentUser?.profilePictureUrl ? (
                <img
                  src={currentUser.profilePictureUrl}
                  alt="Profile"
                  className="avatar-img"
                />
              ) : (
                getInitials(currentUser?.fullName)
              )}
            </div>

            <textarea
              placeholder="Share something with your network..."
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              rows="3"
            />
          </div>

          <div style={{ marginTop: "12px" }}>
            <input type="file" accept="image/*" onChange={uploadPostImage} />
          </div>

          {postImageUrl && (
            <img src={postImageUrl} alt="Preview" className="post-image" />
          )}

          <div className="composer-actions">
            <button type="submit">Post</button>
          </div>
        </form>
      </div>

      {posts.length === 0 ? (
        <div className="card">
          <p>No posts yet.</p>
        </div>
      ) : (
        posts.map((post, index) => {
          const isLastPost = index === posts.length - 1;

          return (
            <article
              className="post-card"
              key={post.id}
              ref={isLastPost ? lastPostRef : null}
            >
              <div className="post-header">
                <div className="small-avatar">
                  {post.profilePictureUrl ? (
                    <img
                      src={post.profilePictureUrl}
                      alt="Profile"
                      className="avatar-img"
                    />
                  ) : (
                    getInitials(post.fullName)
                  )}
                </div>

                <div>
                  <p className="post-author">{post.fullName}</p>
                  <p className="meta">
                    @{post.username} ·{" "}
                    {post.createdAt
                      ? new Date(post.createdAt).toLocaleString()
                      : ""}
                  </p>
                </div>
              </div>

              {post.content && <p className="post-content">{post.content}</p>}

              {post.imageUrl && (
                <img src={post.imageUrl} alt="Post" className="post-image" />
              )}

              <div className="post-stats">
                <span>{post.likesCount || 0} likes</span>
                <span>{post.commentsCount || 0} comments</span>
                <span>Score {post.engagementScore || 0}</span>
              </div>

              <div className="post-actions">
                <button
                  className="secondary-btn"
                  onClick={() => toggleLike(post.id)}
                >
                  Like
                </button>
              </div>

              <div className="comment-list">
                {(commentsByPost[post.id] || []).length === 0 ? (
                  <p className="meta">No comments yet.</p>
                ) : (
                  (commentsByPost[post.id] || []).map((comment) => (
                    <div className="comment-item" key={comment.id}>
                      <p style={{ margin: 0 }}>
                        <strong>{comment.fullName}</strong>{" "}
                        <span className="meta">@{comment.username}</span>
                      </p>
                      <p style={{ margin: "4px 0" }}>{comment.content}</p>
                      <small className="meta">
                        {comment.createdAt
                          ? new Date(comment.createdAt).toLocaleString()
                          : ""}
                      </small>
                    </div>
                  ))
                )}

                <div className="comment-box">
                  <input
                    type="text"
                    placeholder="Write a comment..."
                    value={commentInputs[post.id] || ""}
                    onChange={(e) =>
                      handleCommentInputChange(post.id, e.target.value)
                    }
                  />
                  <button onClick={() => addComment(post.id)}>Comment</button>
                </div>
              </div>
            </article>
          );
        })
      )}
    </div>
  );
}

export default HomePage;