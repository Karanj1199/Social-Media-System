import { useEffect, useState } from "react";
import api from "../services/api";

function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [form, setForm] = useState({
    fullName: "",
    bio: "",
    profilePictureUrl: "",
    headline: "",
    location: "",
  });
  const [postContent, setPostContent] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get("/api/users/me");
      setProfile(res.data);
      setForm({
        fullName: res.data.fullName || "",
        bio: res.data.bio || "",
        profilePictureUrl: res.data.profilePictureUrl || "",
        headline: res.data.headline || "",
        location: res.data.location || "",
      });

      fetchPosts(res.data.id);
    } catch (err) {
      console.error("Failed to fetch profile", err);
      setMessage("Failed to load profile");
    }
  };

  const fetchPosts = async (userId) => {
    try {
      const res = await api.get(`/api/posts/user/${userId}`);
      setPosts(res.data);
    } catch (err) {
      console.error("Failed to fetch posts", err);
    }
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const updateProfile = async (e) => {
    e.preventDefault();
    try {
      const res = await api.put("/api/users/profile", form);
      setProfile(res.data);
      setMessage("Profile updated successfully");
    } catch (err) {
      console.error("Failed to update profile", err);
      setMessage("Failed to update profile");
    }
  };

  const createPost = async (e) => {
    e.preventDefault();
    if (!postContent.trim()) return;

    try {
      await api.post("/api/posts", {
        content: postContent,
      });
      setPostContent("");
      setMessage("Post created successfully");
      fetchPosts(profile.id);
    } catch (err) {
      console.error("Failed to create post", err);
      setMessage("Failed to create post");
    }
  };

  if (!profile) {
    return <div style={{ padding: "2rem" }}>Loading profile...</div>;
  }

  return (
    <div style={{ padding: "2rem", maxWidth: "700px", margin: "0 auto" }}>
      <h2>Profile</h2>

      {message && (
        <p style={{ marginBottom: "1rem", color: "green" }}>
          {message}
        </p>
      )}

      <div
        style={{
          marginBottom: "2rem",
          padding: "1rem",
          border: "1px solid #ddd",
          borderRadius: "8px",
          backgroundColor: "#fff",
        }}
      >
        <p><strong>Name:</strong> {profile.fullName}</p>
        <p><strong>Username:</strong> {profile.username}</p>
        <p><strong>Email:</strong> {profile.email}</p>
        <p><strong>Bio:</strong> {profile.bio || "N/A"}</p>
        <p><strong>Headline:</strong> {profile.headline || "N/A"}</p>
        <p><strong>Location:</strong> {profile.location || "N/A"}</p>
        <p><strong>Profile Picture URL:</strong> {profile.profilePictureUrl || "N/A"}</p>
      </div>

      <h3>Edit Profile</h3>

      <form
        onSubmit={updateProfile}
        style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "2rem" }}
      >
        <input
          type="text"
          name="fullName"
          placeholder="Full Name"
          value={form.fullName}
          onChange={handleChange}
        />

        <input
          type="text"
          name="bio"
          placeholder="Bio"
          value={form.bio}
          onChange={handleChange}
        />

        <input
          type="text"
          name="profilePictureUrl"
          placeholder="Profile Picture URL"
          value={form.profilePictureUrl}
          onChange={handleChange}
        />

        <input
          type="text"
          name="headline"
          placeholder="Headline"
          value={form.headline}
          onChange={handleChange}
        />

        <input
          type="text"
          name="location"
          placeholder="Location"
          value={form.location}
          onChange={handleChange}
        />

        <button type="submit">Update Profile</button>
      </form>

      <h3>Create Post</h3>

      <form
        onSubmit={createPost}
        style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "2rem" }}
      >
        <textarea
          placeholder="What's on your mind?"
          value={postContent}
          onChange={(e) => setPostContent(e.target.value)}
          rows="4"
        />
        <button type="submit">Create Post</button>
      </form>

      <h3>My Posts</h3>

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
            <p style={{ marginBottom: "0.5rem" }}>
              <strong>{post.fullName}</strong> (@{post.username})
            </p>
            <p style={{ marginBottom: "0.5rem" }}>{post.content}</p>
            <small>
              {post.createdAt ? new Date(post.createdAt).toLocaleString() : ""}
            </small>
          </div>
        ))
      )}
    </div>
  );
}

export default ProfilePage;