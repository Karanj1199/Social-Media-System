import { useState, useContext } from "react";
import api from "../services/api";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import toast from "react-hot-toast";

function RegisterPage() {
  const [form, setForm] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");

  try {
    const res = await api.post("/api/auth/register", form);
    login(res.data);
    toast.success("Account created successfully");
    navigate("/");
  } catch (err) {
    setError("Registration failed. Try another email or username.");
    toast.error("Registration failed");
  }
};

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Create account</h1>
        <p className="auth-subtitle">Join SocialSphere and start connecting</p>

        {error && <p style={{ color: "#ef4444" }}>{error}</p>}

        <form className="form-stack" onSubmit={handleSubmit}>
          <input
            name="fullName"
            placeholder="Full name"
            value={form.fullName}
            onChange={handleChange}
          />

          <input
            name="username"
            placeholder="Username"
            value={form.username}
            onChange={handleChange}
          />

          <input
            name="email"
            type="email"
            placeholder="Email address"
            value={form.email}
            onChange={handleChange}
          />

          <input
            name="password"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
          />

          <button type="submit">Create Account</button>
        </form>

        <p style={{ marginTop: "20px" }}>
          Already have an account?{" "}
          <Link className="auth-link" to="/login">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;