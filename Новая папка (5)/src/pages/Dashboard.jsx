import React, { useState, useEffect } from "react";
import Plot from "react-plotly.js";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header"; // Adjust the import path as necessary
import TransportDetails from "../components/TransportDetails"; // Добавьте импорт
import calendarImage from "../assets/images/сalendar.png";
import upImage from "../assets/images/up.png";
import "../components/TransportList/index.css"; // Добавьте импорт стилей
import "../components/Statistics/index.css"; // импортируйте стили статистики

const API_URL = "http://192.168.0.104:5000/api/auth/user/scraped-data";

export default function Dashboard() {
  const navigate = useNavigate();
  const [selectedIP, setSelectedIP] = useState("");
  const [availableIPs, setAvailableIPs] = useState([]);
  const [scrapedData, setScrapedData] = useState([]);
  const [selectedColumn, setSelectedColumn] = useState("");
  const [timeRange, setTimeRange] = useState("1h");
  const [isOpenTimeRange, setIsOpenTimeRange] = useState(false);
  const [isOpenColumn, setIsOpenColumn] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  

  const timeRangeLabel = {
    "1h": "Последний час",
    "6h": "Последние 6 часов",
    "24h": "Последние 24 часа",
    all: "Всё время",
  };

  useEffect(() => {
    fetchUserIPs();
  }, []);

  useEffect(() => {
    if (selectedIP) {
      fetchScrapedData();
    }
  }, [selectedIP, timeRange]);

  const IP_API_URL = "http://192.168.0.104:5000//api/auth/user/ips";

  const fetchUserIPs = async () => {
    const token = localStorage.getItem("token");
    const response = await fetch(IP_API_URL, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.ok) {
      const data = await response.json();
      const uniqueIPs = [...new Set(data.map((entry) => entry.ip))];
      setAvailableIPs(uniqueIPs);
      if (uniqueIPs.length > 0) {
        setSelectedIP(uniqueIPs[0]);
      }
    } else {
      alert("Error fetching user IPs.");
    }
  };

  const fetchScrapedData = async () => {
    const token = localStorage.getItem("token");
    const response = await fetch(API_URL, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();

    if (response.ok) {
      const filteredData = data.filter((entry) => entry.ip === selectedIP);
      const now = new Date();
      const filteredByTime = filteredData.filter((entry) => {
        const entryTime = new Date(entry.timestamp);
        if (timeRange === "1h") return now - entryTime < 3600000;
        if (timeRange === "6h") return now - entryTime < 21600000;
        if (timeRange === "24h") return now - entryTime < 86400000;
        return true;
      });

      setScrapedData(filteredByTime);
      if (filteredByTime.length > 0) {
        setSelectedColumn(Object.keys(filteredByTime[0].data)[0]);
      }
    } else {
      alert("Error fetching data.");
    }
  };

  const handleIPChange = (e) => setSelectedIP(e.target.value);
  const handleColumnChange = (e) => setSelectedColumn(e.target.value);
  const handleTimeRangeChange = (e) => setTimeRange(e.target.value);

  const handleRowCheckbox = (rowKey) => {
    setSelectedRows((prev) =>
      prev.includes(rowKey)
        ? prev.filter((key) => key !== rowKey)
        : [...prev, rowKey]
    );
  };

  // Фильтруем данные для графика по выбранным строкам
  const filteredPlotData = scrapedData
    .map((entry, idx) => ({
      ...entry,
      rowKey: entry.timestamp + entry.ip + idx,
    }))
    .filter(
      (entry) =>
        selectedRows.length === 0 || selectedRows.includes(entry.rowKey)
    )
    .map((entry) => ({
      timestamp: new Date(entry.timestamp),
      value: entry.data[selectedColumn],
    }));

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const dataKeys =
    scrapedData.length > 0 ? Object.keys(scrapedData[0].data) : [];

  return (
    <div
      style={{
        padding: "31px",
        background: "#f5f6fa",
        height: "1024px",
        width: "1440px",
        borderRadius: "29px",
      }}
    >
      <Header
        onLogout={handleLogout}
        selectedIP={selectedIP}
        availableIPs={availableIPs}
        onIPChange={setSelectedIP}
      />
      <h1 style={{ color: "#222",marginTop:'40px', marginBottom:'30px'}}>Доброе утро!</h1>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr",
          gap: 32,
          marginBottom: 32,
        }}
      >
        <div>
          <div className="statistics" style={{ marginBottom: "32px" }}>
            <div className="statistics-header">
              <div className="statistics-header-container">
                <div className="statistics-icon">
                  <img
                    src={require("../assets/images/stats.png")}
                    alt="statistics"
                    className="statistics-image"
                  />
                </div>
                <h2 className="statistics-title">Статистика</h2>
              </div>
              <div
                className="statistics-container"
                style={{ display: "flex", gap: 16 }}
              >
                {/* Кнопка выбора времени */}
                <div
                  className="statistics-date"
                  onClick={() => setIsOpenTimeRange((prev) => !prev)}
                  style={{
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    background: "#fff",
                    padding: "10px 16px",
                    fontWeight: 500,
                    color: "#222",
                    userSelect: "none",
                    minWidth: 170,
                  }}
                >
                  <img
                    src={calendarImage}
                    alt="calendar"
                    className="calendar-image"
                  />
                  <span style={{ marginLeft: 8 }}>
                    {timeRangeLabel[timeRange]}
                  </span>
                  <img
                    src={upImage}
                    alt="up"
                    className="statistics-up"
                    style={{
                      transform: isOpenTimeRange
                        ? "rotate(180deg)"
                        : "rotate(0deg)",
                      transition: "transform 0.2s",
                      marginLeft: "auto",
                    }}
                  />
                </div>
                {isOpenTimeRange && (
                  <div
                    className="statistics-dropdown"
                    style={{
                      left: 0,
                      top: 40,
                      background: "#fff",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
                      zIndex: 10,
                      position: "absolute",
                    }}
                  >
                    <span
                      style={{
                        padding: "10px 16px",
                        cursor: "pointer",
                        borderBottom: "1px solid #f0f0f0",
                        background: timeRange === "1h" ? "#f5f6fa" : "#fff",
                      }}
                      onClick={() => {
                        setTimeRange("1h");
                        setIsOpenTimeRange(false);
                      }}
                    >
                      Последний час
                    </span>
                    <span
                      style={{
                        padding: "10px 16px",
                        cursor: "pointer",
                        borderBottom: "1px solid #f0f0f0",
                        background: timeRange === "6h" ? "#f5f6fa" : "#fff",
                      }}
                      onClick={() => {
                        setTimeRange("6h");
                        setIsOpenTimeRange(false);
                      }}
                    >
                      Последние 6 часов
                    </span>
                    <span
                      style={{
                        padding: "10px 16px",
                        cursor: "pointer",
                        borderBottom: "1px solid #f0f0f0",
                        background: timeRange === "24h" ? "#f5f6fa" : "#fff",
                      }}
                      onClick={() => {
                        setTimeRange("24h");
                        setIsOpenTimeRange(false);
                      }}
                    >
                      Последние 24 часа
                    </span>
                    <span
                      style={{
                        padding: "10px 16px",
                        cursor: "pointer",
                        background: timeRange === "all" ? "#f5f6fa" : "#fff",
                      }}
                      onClick={() => {
                        setTimeRange("all");
                        setIsOpenTimeRange(false);
                      }}
                    >
                      Всё время
                    </span>
                  </div>
                )}
                {/* Кнопка выбора колонки */}
                <div style={{ position: "relative", minWidth: 200 }}>
                  <div
                    className="statistics-date"
                    onClick={() => setIsOpenColumn((prev) => !prev)}
                    style={{
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      background: "#fff",
                      borderRadius: 8,
                      padding: "10px 16px",
                      fontWeight: 500,
                      color: "#222",
                      userSelect: "none",
                      minWidth: 170,
                    }}
                  >
                    <img
                      src={require("../assets/images/category.png")}
                      alt="columns"
                      style={{ width: 16, height: 16 }}
                    />
                    <span style={{ marginLeft: 8 }}>
                      {selectedColumn || "Выбрать столбец"}
                    </span>
                    <img
                      src={upImage}
                      alt="up"
                      className="statistics-up"
                      style={{
                        transform: isOpenColumn
                          ? "rotate(180deg)"
                          : "rotate(0deg)",
                        transition: "transform 0.2s",
                        marginLeft: "auto",
                      }}
                    />
                  </div>
                  {isOpenColumn && (
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
                      {dataKeys.map((key) => (
                        <span
                          key={key}
                          style={{
                            padding: "10px 16px",
                            cursor: "pointer",
                            borderBottom: "1px solid #f0f0f0",
                            background:
                              selectedColumn === key ? "#f5f6fa" : "#fff",
                          }}
                          onClick={() => {
                            setSelectedColumn(key);
                            setIsOpenColumn(false);
                          }}
                        >
                          {key}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <Plot
              data={[
                {
                  x: filteredPlotData.map((entry) => entry.timestamp),
                  y: filteredPlotData.map((entry) => entry.value),
                  type: "scatter",
                  mode: "lines+markers",
                  marker: { color: "#1976d2" },
                },
              ]}
              layout={{
                width: 846,
                height: 200,
                title: "Статистика",
                paper_bgcolor: "#fff",
                plot_bgcolor: "#fff",
                font: { color: "#222" },
                margin: { t: 40, l: 40, r: 20, b: 40 },
              }}
            />
          </div>
          <div
            style={{
              maxWidth: 872,
              maxHeight: 402,
              borderRadius: 18,
              background: "#fff",
              boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
              padding: 24,
            }}
          >
            <h2 style={{ color: "#222", marginBottom: 16 }}>Список транспорта</h2>
            <div
              style={{
                overflowX: "auto",
                width: "825.6068115234375px",
                height: "286.4966125488281px",
              }}
            >
              <table className="transport-table">
                <thead>
                  <tr>
                    <th></th>
                    <th
                      style={{
                        color: "#222",
                        background: "#f8f8f8",
                        border: "none",
                        padding: "10px",
                        fontWeight: 600,
                        borderTopLeftRadius: 8,
                      }}
                    >
                      Timestamp
                    </th>
                    <th
                      style={{
                        color: "#222",
                        background: "#f8f8f8",
                        border: "none",
                        padding: "10px",
                        fontWeight: 600,
                      }}
                    >
                      IP
                    </th>
                    {dataKeys.map((key, i) => (
                      <th
                        key={key}
                        style={{
                          color: "#222",
                          background: "#f8f8f8",
                          border: "none",
                          padding: "10px",
                          fontWeight: 600,
                        }}
                      >
                        {key}
                      </th>
                    ))}
                    <th
                      style={{
                        color: "#222",
                        background: "#f8f8f8",
                        border: "none",
                        padding: "10px",
                        fontWeight: 600,
                        borderTopRightRadius: 8,
                      }}
                    >
                      Anomaly
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {scrapedData.length > 0 ? (
                    scrapedData.map((row, idx) => {
                      const rowKey = row.timestamp + row.ip + idx;
                      return (
                        <tr
                          key={rowKey}
                          className="transport-list-item"
                          style={{
                            background: idx % 2 === 0 ? "#fafbfc" : "#fff",
                          }}
                        >
                          <td>
                            <input
                              type="checkbox"
                              checked={selectedRows.includes(rowKey)}
                              onChange={() => handleRowCheckbox(rowKey)}
                            />
                          </td>
                          <td
                            style={{
                              color: "#222",
                              border: "none",
                              padding: "10px",
                            }}
                          >
                            {row.timestamp}
                          </td>
                          <td
                            style={{
                              color: "#222",
                              border: "none",
                              padding: "10px",
                            }}
                          >
                            {row.ip}
                          </td>
                          {dataKeys.map((key) => (
                            <td
                              key={key}
                              style={{
                                color: "#222",
                                border: "none",
                                padding: "10px",
                              }}
                            >
                              {row.data[key]}
                            </td>
                          ))}
                          <td
                            style={{
                              color: row.anomaly ? "red" : "#222",
                              border: "none",
                              padding: "10px",
                              fontWeight: row.anomaly ? 700 : 400,
                            }}
                          >
                            {row.anomaly ? row.anomaly : ""}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td
                        colSpan={4 + dataKeys.length}
                        style={{
                          color: "#222",
                          textAlign: "center",
                          padding: "16px",
                        }}
                      >
                        No Data
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div style={{ minWidth: 480 }}>
          <TransportDetails
            selectedCars={selectedRows}
            transportData={scrapedData.map((row, idx) => ({
              id: row.timestamp + row.ip + idx,
              anomaly: row.anomaly ? "Есть" : "",
              ...row.data, // Передаем все данные из row.data
              ip: row.ip,
              timestamp: row.timestamp,
            }))}
          />
        </div>
      </div>
    </div>
  );
}
