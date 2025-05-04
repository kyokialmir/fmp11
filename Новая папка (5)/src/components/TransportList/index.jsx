import React from 'react';
import './index.css';

const TransportList = ({ transportData, selectedCars, toggleCarSelection }) => {
  return (
    <div className="transport-list">
      <h2 className="transport-list-title">Список транспорта</h2>
      <table className="transport-table">
        <thead>
          <tr>
            <th></th>
            <th>Номер машины</th>
            <th>Категория</th>
            <th>Расстояние</th>
            <th>Время потрачено</th>
            <th>Топливо потрачено</th>
            <th>Загрузка</th>
            <th>Аномалии</th>
          </tr>
        </thead>
        <tbody>
          {transportData.map((car) => (
            <tr key={car.id} className="transport-list-item">
              <td>
                <input
                  type="checkbox"
                  checked={selectedCars.includes(car.id)}
                  onChange={() => toggleCarSelection(car.id)}Ц
                />
              </td>
              <td className="car-id transport-list-title">{car.id}</td>
              <td>{car.category}</td>
              <td>{car.distance}</td>
              <td>{car.time}</td>
              <td>{car.fuel}</td>
              <td>{car.load}</td>
              <td>{car.anomaly}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TransportList;