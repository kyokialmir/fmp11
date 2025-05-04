import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import styles from "./LoginPage.module.css";
import logo from "../assets/images/logo.png";

export default function LoginPage({ setIsAuthenticated, setIsAdmin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://127.0.0.1:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.access_token);
        localStorage.setItem("user", JSON.stringify({ username: data.username, role: data.role }));

        setIsAuthenticated(true);
        setIsAdmin(data.role === "admin");

        navigate(data.role === "admin" ? "/admin-dashboard" : "/dashboard");
      } else {
        alert("Ошибка входа! Проверьте данные.");
      }
    } catch (error) {
      console.error("Error during login:", error);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles["image-section"]}>
        <div className={styles["image-inner"]} />
      </div>
      <div className={styles["login-section"]}>
        <div className={styles.header}>
          <img src={logo} alt="Logo" className={styles.logo} />
          <p className={styles.techPro}>tech-pro</p>
        </div>
        <h1 className={styles.h1}>Добро пожаловать!</h1>
        <p className={styles.p}>Введите свои данные для входа</p>
        <form onSubmit={handleLogin} className={styles.form}>
          <label className={styles.label}>Логин</label>
          <input
            type="text"
            placeholder="Введите логин"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className={styles.input}
          />

          <label className={styles.label}>Пароль</label>
          <input
            type="password"
            placeholder="Введите пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className={styles.input}
          />

          <div className={styles.options}>
            <label className={styles["remember-me"]}>
              <input type="checkbox" className={styles["remember-me-input"]} />
              Запомнить меня
            </label>
            <a href="#" className={styles["forgot-password"]}>Забыли пароль?</a>
          </div>

          <button type="submit" className={styles["login-button"]}>Войти</button>

          <div className={styles.signup}>
            <p className={styles["signup-p"]}>
              Нет аккаунта? <a href="/signup" className={styles["signup-a"]}>Зарегистрироваться</a>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}