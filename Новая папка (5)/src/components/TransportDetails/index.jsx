import React from "react";
import "./index.css";
import chooseImage from "../../assets/images/choose.png";
import smileImage from "../../assets/images/smile.png";
import truck from "../../assets/images/truck.png";

const TransportDetails = ({ selectedCars, transportData }) => {
  if (selectedCars.length === 0) {
    return (
      <div className="transport-details">
        <img src={chooseImage} alt="choose" />
        Для обзора выберите аномалию
      </div>
    );
  }

  const selectedTransportDetails = transportData.filter((car) =>
    selectedCars.includes(car.id)
  );

  const hasAnomalies = selectedTransportDetails.some(
    (car) => car.anomaly === "Есть"
  );

  if (!hasAnomalies) {
    return (
      <div className="transport-details">
        <img src={smileImage} alt="choose" />
        На данный момент аномалий не выявлено
      </div>
    );
  }

  return (
    <div className="transport-details scrollable">
      {selectedTransportDetails.map((car) => (
        <div key={car.id} className="transport-card">
          <div className="transport-card-content">
            <div className="transport-card-header">
              <span className="transport-card-id">01KG043AL</span>
            </div>
            <h3 className="transport-card-title">
              {car.anomaly === "Есть"
                ? "Аномалия обнаружена"
                : "Детали транспорта"}
            </h3>
            <div className="transport-card-info" style={{ width: "177px" }}>
              {Object.entries(car)
                .filter(([key]) => !["id", "anomaly"].includes(key))
                .slice(0, 3)
                .map(([key, value]) => (
                  <p key={key}>
                    <b>{key}:</b> {value}
                  </p>
                ))}
            </div>
          </div>
          <img
            src={truck}
            alt="truck"
            className="transport-card-image"
            style={{ width: "158.453px", height: "183.203px" }}
          />
        </div>
      ))}
    </div>
  );
};

export default TransportDetails;
