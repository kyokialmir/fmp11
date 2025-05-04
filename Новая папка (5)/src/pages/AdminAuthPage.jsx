import { useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = "http://192.168.0.104:5000//api/auth"; // Adjust API URL if needed

export default function AdminAuthPage({ setIsAuthenticated }) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = isRegistering ? "/register-admin" : "/login";
    const requestData = { username, password };

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestData),
      });

      const data = await response.json();

      if (response.ok) {
        if (!isRegistering) {
          // If logging in, store JWT and redirect
          localStorage.setItem("token", data.access_token);
          setIsAuthenticated(true);
          navigate("/admin-dashboard");
        } else {
          alert("Admin registered! You can now log in.");
          setIsRegistering(false);
        }
      } else {
        alert(data.error || "An error occurred.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Connection error.");
    }
  };

  return (
    <div className="admin-auth-container">
      <h1>{isRegistering ? "Register Admin" : "Admin Login"}</h1>
      <form onSubmit={handleSubmit}>
        <label>Username</label>
        <input
          type="text"
          placeholder="Enter username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />

        <label>Password</label>
        <input
          type="password"
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit">{isRegistering ? "Register" : "Login"}</button>
      </form>

      <p>
        {isRegistering ? "Already an admin?" : "No admin registered?"}{" "}
        <span className="toggle-link" onClick={() => setIsRegistering(!isRegistering)}>
          {isRegistering ? "Log in" : "Register"}
        </span>
      </p>
    </div>
  );
}
