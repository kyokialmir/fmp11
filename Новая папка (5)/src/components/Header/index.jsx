import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./index.css";
import locationImage from "../../assets/images/location.png";
import logoImage from "../../assets/images/logo.png";
import exitImage from "../../assets/images/exit.png";
import upImage from "../../assets/images/up.png";
import profile from "../../assets/images/profile.png";

const Header = ({ onLogout, selectedIP, availableIPs, onIPChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isOpenIP, setIsOpenIP] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="header">
      <div className="logo">
        <img src={logoImage} alt="logo" />
        TECH-PRO
      </div>
      <div style={{ position: "relative", minWidth: 200 }}>
        <div
          className="statistics-date"
          onClick={() => setIsOpenIP((prev) => !prev)}
          style={{
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            background: "#fff",
            borderRadius: '30px',
            padding: "10px 16px",
            fontWeight: 500,
            color: "#222",
            userSelect: "none",
          }}
        >
          <img src={locationImage} alt="location" />
          <span style={{ marginLeft: 8 }}>
            {selectedIP || "Выбрать IP"}
          </span>
          <img
            src={upImage}
            alt="up"
            className="statistics-up"
            style={{
              transform: isOpenIP ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.2s",
              marginLeft: "auto",
            }}
          />
        </div>
        {isOpenIP && (
          <div
            className="statistics-dropdown"
            style={{
              left: 0,
              top: 40,
              background: "#fff",
              borderRadius: 8,
              boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
              zIndex: 10,
              position: "absolute",
            }}
          >
            {availableIPs.map((ip) => (
              <span
                key={ip}
                style={{
                  padding: "10px 16px",
                  cursor: "pointer",
                  borderBottom: "1px solid #f0f0f0",
                  background: selectedIP === ip ? "#f5f6fa" : "#fff",
                  display: "block",
                }}
                onClick={() => {
                  onIPChange(ip);
                  setIsOpenIP(false);
                }}
              >
                {ip}
              </span>
            ))}
          </div>
        )}
      </div>
      <div className="profile-container">
        <div
          className={`profile ${isOpen ? "open" : ""}`}
          onClick={() => setIsOpen(!isOpen)}
        >
          <img src={profile} alt="avatar" className="avatar" style={{width: '41px',height: '41px'}}/>
          <span>Мэлс Эркинбек</span>
          <img
            src={upImage}
            alt="up"
            className="statistics-up"
            style={{
              transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.2s",
              marginLeft: "auto",
            }}
          />
        </div>
        {isOpen && (
          <div className="dropdown">
            <p className="email">mels_erkinbek@gmail.com</p>
            <label className="theme-toggle">
              <label className="switch">
                <input type="checkbox" />
                <span className="slider"></span>
              </label>
              Темная тема
            </label>
            <button className="logout" onClick={onLogout}>
              <img src={exitImage} className="exit-icon" alt="exit" /> Выйти
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
