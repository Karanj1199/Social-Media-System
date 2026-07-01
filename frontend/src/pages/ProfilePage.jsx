import { useEffect, useState } from "react";
import api from "../services/api";
import toast from "react-hot-toast";

function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [followCounts, setFollowCounts] = useState({
    followersCount: 0,
    followingCount: 0,
  });

  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);

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

      const countsRes = await api.get(
        `/api/users/${res.data.id}/follow-counts`
      );
      setFollowCounts(countsRes.data);
    } catch (err) {
      console.error("Failed to fetch profile", err);
      setMessage("Failed to load profile");
      toast.error("Failed to load profile");
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

  const fetchFollowers = async () => {
    try {
      const res = await api.get(`/api/users/${profile.id}/followers`);
      setFollowers(res.data);
      setShowFollowers(true);
    } catch (err) {
      toast.error("Failed to load followers");
    }
  };

  const fetchFollowing = async () => {
    try {
      const res = await api.get(`/api/users/${profile.id}/following`);
      setFollowing(res.data);
      setShowFollowing(true);
    } catch (err) {
      toast.error("Failed to load following");
    }
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const uploadProfilePicture = async (e) => {
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

      setForm((prev) => ({
        ...prev,
        profilePictureUrl: res.data,
      }));

      toast.success("Profile picture uploaded");
    } catch (err) {
      console.error("Failed to upload image", err);
      toast.error("Failed to upload profile picture");
    }
  };

  const updateProfile = async (e) => {
    e.preventDefault();

    try {
      const res = await api.put("/api/users/profile", form);
      setProfile(res.data);
      setMessage("Profile updated successfully");
      toast.success("Profile updated successfully");
    } catch (err) {
      console.error("Failed to update profile", err);
      setMessage("Failed to update profile");
      toast.error("Failed to update profile");
    }
  };

  const createPost = async (e) => {
    e.preventDefault();

    if (!postContent.trim()) {
      toast.error("Post cannot be empty");
      return;
    }

    try {
      await api.post("/api/posts", {
        content: postContent,
      });

      setPostContent("");
      setMessage("Post created successfully");
      toast.success("Post created successfully");
      fetchPosts(profile.id);
    } catch (err) {
      console.error("Failed to create post", err);
      setMessage("Failed to create post");
      toast.error("Failed to create post");
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
          <div className="avatar">
            {profile.profilePictureUrl ? (
              <img
                src={profile.profilePictureUrl}
                alt="Profile"
                className="avatar-img"
              />
            ) : (
              initials
            )}
          </div>

          <div>
            <h1 style={{ margin: 0 }}>{profile.fullName}</h1>
            <p style={{ margin: "6px 0" }}>@{profile.username}</p>
            <p style={{ margin: 0 }}>
              {profile.headline || "No headline yet"}
            </p>
          </div>
        </div>

        <div className="profile-stats">
          <div
            className="profile-stat"
            style={{ cursor: "pointer" }}
            onClick={fetchFollowers}
          >
            <strong>{followCounts.followersCount}</strong>
            <div>Followers</div>
          </div>

          <div
            className="profile-stat"
            style={{ cursor: "pointer" }}
            onClick={fetchFollowing}
          >
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

          <div>
            <label>Upload Profile Picture</label>

            <input type="file" accept="image/*" onChange={uploadProfilePicture} />
          </div>

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

            {post.content && <p>{post.content}</p>}

            {post.imageUrl && (
              <img src={post.imageUrl} alt="Post" className="post-image" />
            )}

            <p className="meta">
              {post.createdAt ? new Date(post.createdAt).toLocaleString() : ""}
            </p>
          </div>
        ))
      )}
  {showFollowers && (
    <div className="modal-overlay">
      <div className="card">
        <h2>Followers</h2>

        {followers.length === 0 ? (
          <p>No followers yet.</p>
        ) : (
          followers.map((user) => (
            <div
              key={user.id}
              style={{
                padding: "10px 0",
                borderBottom: "1px solid var(--border-color)",
              }}
            >
              <strong>{user.fullName}</strong>
              <div className="meta">@{user.username}</div>
            </div>
          ))
        )}

        <button onClick={() => setShowFollowers(false)}>Close</button>
      </div>
    </div>
  )}

  {showFollowing && (
    <div className="modal-overlay">
      <div className="card">
        <h2>Following</h2>

        {following.length === 0 ? (
          <p>Not following anyone yet.</p>
        ) : (
          following.map((user) => (
            <div
              key={user.id}
              style={{
                padding: "10px 0",
                borderBottom: "1px solid var(--border-color)",
              }}
            >
              <strong>{user.fullName}</strong>
              <div className="meta">@{user.username}</div>
            </div>
          ))
        )}

        <button onClick={() => setShowFollowing(false)}>Close</button>
      </div>
    </div>
  )}
    </div>
  );
}

export default ProfilePage;