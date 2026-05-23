import { useEffect, useState } from "react";
import api from "../services/api";

function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [followCounts, setFollowCounts] = useState({
    followersCount: 0,
    followingCount: 0,
  });

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

      const countsRes = await api.get(`/api/users/${res.data.id}/follow-counts`);
      setFollowCounts(countsRes.data);
    } catch (err) {
      console.error("Failed to fetch profile", err);
      setMessage("Failed to load profile");
    }
  };

  const fetchPosts = async (userId) => {
    try {
      const res = await api.get(`/api/posts/user/${userId}?page=0&size=10`);
      setPosts(res.data.content || []);
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
    return <div className="page-container">Loading profile...</div>;
  }

  const initials = profile.fullName
    ? profile.fullName
        .split(" ")
        .map((name) => name[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "U";

  return (
    <div className="page-container">
      <div className="profile-header">
        <div className="profile-top">
          <div className="avatar">{initials}</div>

          <div>
            <h1 style={{ margin: 0 }}>{profile.fullName}</h1>
            <p style={{ margin: "6px 0" }}>@{profile.username}</p>
            <p style={{ margin: 0 }}>{profile.headline || "No headline yet"}</p>
          </div>
        </div>

        <div className="profile-stats">
          <div className="profile-stat">
            <strong>{followCounts.followersCount}</strong>
            <div>Followers</div>
          </div>

          <div className="profile-stat">
            <strong>{followCounts.followingCount}</strong>
            <div>Following</div>
          </div>

          <div className="profile-stat">
            <strong>{posts.length}</strong>
            <div>Posts</div>
          </div>
        </div>
      </div>

      {message && <p className="meta">{message}</p>}

      <div className="card">
        <h3>About</h3>
        <p>{profile.bio || "No bio added yet."}</p>
        <p className="meta">{profile.location || "No location added"}</p>
        <p className="meta">{profile.email}</p>
      </div>

      <div className="card">
        <h3>Edit Profile</h3>

        <form className="form-stack" onSubmit={updateProfile}>
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
      </div>

      <div className="card">
        <h3>Create Post</h3>

        <form className="form-stack" onSubmit={createPost}>
          <textarea
            placeholder="What's on your mind?"
            value={postContent}
            onChange={(e) => setPostContent(e.target.value)}
            rows="4"
          />

          <button type="submit">Create Post</button>
        </form>
      </div>

      <h3 className="section-title">My Posts</h3>

      {posts.length === 0 ? (
        <div className="card">
          <p>No posts yet.</p>
        </div>
      ) : (
        posts.map((post) => (
          <div className="card" key={post.id}>
            <p>
              <strong>{post.fullName}</strong>{" "}
              <span className="meta">@{post.username}</span>
            </p>
            <p>{post.content}</p>
            <p className="meta">
              {post.createdAt ? new Date(post.createdAt).toLocaleString() : ""}
            </p>
          </div>
        ))
      )}
    </div>
  );
}

export default ProfilePage;