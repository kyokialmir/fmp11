import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = "http://192.168.0.104:5000//api/auth/admin";

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({ username: "", email: "", full_name: "", password: "", ips: [] });
  const [ipToAssign, setIpToAssign] = useState({ username: "", ip: "" });
  const navigate = useNavigate(); // ✅ Navigation for logout

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      } else {
        console.error("Error fetching users:", response.statusText);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleCreateUser = async () => {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_URL}/create-user`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(newUser),
    });

    if (response.ok) {
      alert("User created successfully!");
      fetchUsers();
    } else {
      alert("Error creating user.");
    }
  };

  const handleAssignIp = async () => {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_URL}/assign-ip`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(ipToAssign),
    });

    if (response.ok) {
      alert("IP assigned successfully!");
      fetchUsers();
    } else {
      alert("Error assigning IP.");
    }
  };

  // ✅ Logout function
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login"); // ✅ Redirect to login page after logout
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Admin Dashboard</h1>

      {/* Logout Button */}
      <button onClick={handleLogout} style={{ float: "right", background: "red", color: "white", padding: "10px", border: "none", cursor: "pointer" }}>
        Logout
      </button>

      <h2>Registered Users</h2>
      <table border="1" cellPadding="5" style={{ width: "100%", textAlign: "left" }}>
        <thead>
          <tr>
            <th>Username</th>
            <th>Email</th>
            <th>Full Name</th>
            <th>Role</th>
            <th>Assigned IPs</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td>{user.username}</td>
              <td>{user.email}</td>
              <td>{user.full_name}</td>
              <td>{user.role}</td>
              <td>{user.ips.join(", ") || "No IPs Assigned"}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Create New User</h2>
      <input type="text" placeholder="Username" onChange={e => setNewUser({ ...newUser, username: e.target.value })} />
      <input type="text" placeholder="Email" onChange={e => setNewUser({ ...newUser, email: e.target.value })} />
      <input type="text" placeholder="Full Name" onChange={e => setNewUser({ ...newUser, full_name: e.target.value })} />
      <input type="password" placeholder="Password" onChange={e => setNewUser({ ...newUser, password: e.target.value })} />
      <button onClick={handleCreateUser}>Create User</button>

      <h2>Assign IP</h2>
      <input type="text" placeholder="Username" onChange={e => setIpToAssign({ ...ipToAssign, username: e.target.value })} />
      <input type="text" placeholder="IP Address" onChange={e => setIpToAssign({ ...ipToAssign, ip: e.target.value })} />
      <button onClick={handleAssignIp}>Assign IP</button>
    </div>
  );
}
