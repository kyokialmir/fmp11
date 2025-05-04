import { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import AdminAuthPage from "./pages/AdminAuthPage";
import AdminDashboard from "./pages/AdminDashboard";
import Header from "./components/Header";
import Dashboard from "./pages/Dashboard";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (token && storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setIsAuthenticated(true);
        setIsAdmin(userData.role === "admin"); // ✅ Now updates on refresh
      } catch (error) {
        console.error("Error parsing user data:", error);
        localStorage.removeItem("user");
        setIsAuthenticated(false);
        setIsAdmin(false);
      }
    } else {
      setIsAuthenticated(false);
      setIsAdmin(false);
    }
  }, []);

  if (isAuthenticated === null) {
    return <div>Loading...</div>;
  }

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsAuthenticated(false);
    setIsAdmin(false);
  };

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Navigate to={isAdmin ? "/admin-dashboard" : "/dashboard"} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/login"
          element={
            <LoginPage
              setIsAuthenticated={setIsAuthenticated}
              setIsAdmin={setIsAdmin}
            />
          }
        />
        <Route
          path="/admin-auth"
          element={<AdminAuthPage setIsAuthenticated={setIsAuthenticated} />}
        />

        {isAuthenticated && (
          <>
            {isAdmin ? (
              <Route path="/admin-dashboard" element={<AdminDashboard />} />
            ) : (
              <Route path="/dashboard" element={<Dashboard />} />
            )}
          </>
        )}

        <Route
          path="*"
          element={
            <Navigate
              to={
                isAuthenticated
                  ? isAdmin
                    ? "/admin-dashboard"
                    : "/dashboard"
                  : "/login"
              }
            />
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
