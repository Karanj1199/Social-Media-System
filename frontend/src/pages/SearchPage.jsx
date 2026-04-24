import { useState } from "react";
import api from "../services/api";

function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);

  const handleSearch = async () => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    try {
      const res = await api.get(`/api/users/search?query=${query}`);
      setResults(res.data);
    } catch (err) {
      console.error("Failed to search users", err);
    }
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "700px", margin: "0 auto" }}>
      <h2>Search Users</h2>

      <div style={{ marginBottom: "1rem" }}>
        <input
          type="text"
          placeholder="Search by username or full name"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ width: "70%", padding: "0.75rem", marginRight: "0.5rem" }}
        />
        <button onClick={handleSearch}>Search</button>
      </div>

      {results.length === 0 ? (
        <p>No results yet.</p>
      ) : (
        results.map((user) => (
          <div
            key={user.id}
            style={{
              border: "1px solid #ddd",
              borderRadius: "8px",
              padding: "1rem",
              marginBottom: "1rem",
              backgroundColor: "#fff",
            }}
          >
            <p><strong>{user.fullName}</strong> (@{user.username})</p>
            <p>{user.email}</p>
            <p>{user.bio || "No bio"}</p>
          </div>
        ))
      )}
    </div>
  );
}

export default SearchPage;