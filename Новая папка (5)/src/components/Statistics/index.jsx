import React from "react";
import Plot from "react-plotly.js";
import "./index.css";
import statsImage from "../../assets/images/stats.png";
import { useState } from "react";
import calendarImage from "../../assets/images/сalendar.png";
import upImage from "../../assets/images/up.png";


const API_URL = "http://193.34.225.199:5000/api";

const fetchRawData = async () => {
  const token = localStorage.getItem("token");
  if (!token) {
    console.error("No token found, redirecting to login.");
    return;
  }

  try {
    const response = await fetch(`${API_URL}/data/raw`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await response.json();
    console.log("Raw Data:", data);
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};


const Statistics = ({ plotData }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="statistics">
      <div className="statistics-header">
        <div className="statistics-header-container">
          <div className="statistics-icon">
            <img
              src={statsImage}
              alt="statistics"
              className="statistics-image"
            />
          </div>
          <h2 className="statistics-title">Статистика</h2>
        </div>
        <div className="statistics-container">
          <div className="statistics-date" onClick={() => setIsOpen(!isOpen)}>
            <img
              src={calendarImage}
              alt="calendar"
              className="calendar-image"
            />
            Выберите дату
            <img src={upImage} alt="up" className="statistics-up" />
          </div>

          {isOpen && (
            <div className="statistics-dropdown">
              <span>Текущая неделя</span>
              <span>Прошлая неделя</span>
              <span>Текущий месяц</span>
              <span>Прошлый месяц</span>
            </div>
          )}
        </div>
      </div>
      <Plot
        data={plotData}
        layout={{ width: "100%", height: 300, title: "Статистика" }}
      />
    </div>
  );
};

export default Statistics;
