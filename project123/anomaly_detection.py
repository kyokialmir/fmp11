import numpy as np
import json
import time
import os
import joblib
from threading import Thread
from sklearn.ensemble import IsolationForest
from db import MainSessionLocal
from models import ScrapedData, IPAddress
import datetime
import re


MODEL_DIR = "models/"
if not os.path.exists(MODEL_DIR):
    os.makedirs(MODEL_DIR)

def get_model_path(ip):
    sanitized_ip = re.sub(r"[^\w\-_.]", "_", ip)
    return os.path.join(MODEL_DIR, f"model_{sanitized_ip}.pkl")

def fetch_training_data(ip):
    db_session = MainSessionLocal()
    data_entries = db_session.query(ScrapedData).filter_by(ip=ip).all()
    db_session.close()

    sensor_data = []
    first_timestamp = None  # Track first timestamp to normalize time

    for entry in data_entries:
        try:
            # ✅ Ensure entry.data is correctly parsed
            readings = json.loads(entry.data) if isinstance(entry.data, str) else entry.data
            
            # ✅ Convert timestamp to Unix time
            if isinstance(entry.timestamp, str):  # If timestamp is a string
                timestamp_obj = datetime.datetime.fromisoformat(entry.timestamp)
            else:
                timestamp_obj = entry.timestamp  # Already a datetime object

            unix_time = timestamp_obj.timestamp()  # Convert to seconds since 1970
            
            # ✅ Normalize timestamps (optional)
            if first_timestamp is None:
                first_timestamp = unix_time  # Set first timestamp as reference
            normalized_time = unix_time - first_timestamp

            # ✅ Convert sensor readings to float, but exclude timestamp fields
            sensor_values = []
            for key, value in readings.items():
                if "time" not in key.lower():  # ✅ Exclude time-related fields
                    sensor_values.append(float(value))  # Convert only numerical values
            
            sensor_values.append(normalized_time)  # ✅ Add normalized time as last column
            sensor_data.append(sensor_values)

        except ValueError as ve:
            print(f"❌ ValueError: Could not convert {value} to float. Skipping entry.")
            continue
        except Exception as e:
            print(f"❌ Unexpected Error: {e}")
            continue

    return np.array(sensor_data) if sensor_data else None

def train_model_for_ip(ip):
    """Train an anomaly detection model for a specific IP address."""
    sensor_data = fetch_training_data(ip)
    
    if sensor_data is None or len(sensor_data) == 0:
        print(f"⚠️ No training data available for IP {ip}. Skipping model training.")
        return

    first_timestamp = sensor_data[0, -1]  # ✅ Extract first timestamp from training data

    # ✅ Train Isolation Forest model
    model = IsolationForest(contamination=0.01)
    model.fit(sensor_data)

    # ✅ Ensure directory exists
    model_path = get_model_path(ip)
    os.makedirs(os.path.dirname(model_path), exist_ok=True)

    # ✅ Save only (model, first_timestamp) and flush to disk
    with open(model_path, "wb") as f:
        joblib.dump((model, first_timestamp), f)
        f.flush()  # ✅ Force write to disk

    print(f"✅ Model successfully saved for IP {ip}: {model_path}")  

def train_models_for_all_ips():
    while True:
        db_session = MainSessionLocal()
        ips = db_session.query(IPAddress).all()
        db_session.close()

        for ip_entry in ips:
            train_model_for_ip(ip_entry.ip)

        time.sleep(86400)  # ✅ Retrain once per day (24 hours)

def detect_anomalies(new_data, ip):
    """Detect anomalies using the trained model for a given IP address."""
    try:
        model_path = get_model_path(ip)

        # ✅ Wait for the model file to be created if it doesn't exist
        retry_attempts = 5  # Number of retries before giving up
        while not os.path.exists(model_path) or os.path.getsize(model_path) < 1024:
            print(f"⏳ Waiting for model to be trained for IP {ip}...")
            time.sleep(2)  # Wait 2 seconds before retrying
            retry_attempts -= 1
            if retry_attempts == 0:
                print(f"❌ Model for IP {ip} is still missing or incomplete after retries!")
                return False

        model, first_timestamp = joblib.load(model_path)  # ✅ Load (model, first_timestamp)

        # ✅ Convert new_data to dictionary if it's a JSON string
        if isinstance(new_data, str):
            new_data = json.loads(new_data)

        # ✅ Convert timestamp to Unix time and normalize it
        if "timestamp" in new_data:
            try:
                timestamp_obj = datetime.datetime.fromisoformat(new_data["timestamp"])
                unix_time = timestamp_obj.timestamp()
                normalized_time = unix_time - first_timestamp  # Normalize
                new_data["timestamp"] = normalized_time  # Store normalized time
            except ValueError:
                print(f"⚠️ Warning: Invalid timestamp format {new_data['timestamp']}")
                return False

        # ✅ Convert all values to float
        processed_data = [float(value) for key, value in new_data.items()]

        anomaly_score = model.predict(np.array(processed_data).reshape(1, -1))

        return anomaly_score[0] == -1  # -1 means anomaly
    except EOFError:
        print(f"❌ EOFError: Model file for {ip} is corrupted. Retraining...")
        os.remove(model_path)  # ✅ Delete corrupted model
        train_model_for_ip(ip)  # ✅ Retrain model
        return False
    except Exception as e:
        print(f"❌ Anomaly detection error for IP {ip}: {e}")
        return False



def start_per_ip_anomaly_training():
    Thread(target=train_models_for_all_ips, daemon=True).start()
