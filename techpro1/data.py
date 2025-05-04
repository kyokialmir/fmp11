from flask import Flask, jsonify, Response
import numpy as np
import datetime
import time
import threading

app = Flask(__name__)

# Global variable to store the latest sensor readings
latest_sensor_data = {}

def generate_sensor_data():
    """ Periodically updates sensor readings """
    global latest_sensor_data
    while True:
        timestamp = datetime.datetime.utcnow().isoformat()
        latest_sensor_data = {
            "timestamp": timestamp,
            "temperature": round(22 + 5 * np.sin(2 * np.pi * datetime.datetime.utcnow().hour / 24) + np.random.normal(0, 0.5), 2),
            "humidity": round(60 - 15 * np.sin(2 * np.pi * datetime.datetime.utcnow().hour / 24) + np.random.normal(0, 2), 2),
            "pressure": round(1013 + np.random.normal(0, 0.3), 2),
            "vibration": round(1 + (3 if np.random.rand() < 0.01 else 0) + np.random.normal(0, 0.2), 2),
            "current": round(5 + np.random.normal(0, 0.5) if np.random.rand() < 0.8 else 0.5, 2)
        }
        time.sleep(5)  # Updates data every 5 seconds

@app.route('/get_sensor_data', methods=['GET'])
def get_sensor_data():
    """ Returns the latest sensor readings """
    return jsonify(latest_sensor_data)

@app.route('/stream_sensors', methods=['GET'])
def stream_sensors():
    """ Streams continuous sensor data using Server-Sent Events (SSE) """
    def event_stream():
        while True:
            time.sleep(5)
            yield f"data: {jsonify(latest_sensor_data).data.decode()}\n\n"
    return Response(event_stream(), mimetype='text/event-stream')

if __name__ == '__main__':
    # Start sensor data generation in a separate thread
    threading.Thread(target=generate_sensor_data, daemon=True).start()
    app.run(host='0.0.0.0', port=5002, debug=True, use_reloader=False)