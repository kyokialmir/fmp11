import requests
import time

def fetch_sensor_data():
    """ Periodically fetches sensor data and prints it """
    url = "http://localhost:5002/get_sensor_data"  # Update with actual server address if needed
    
    while True:
        try:
            response = requests.get(url)
            if response.status_code == 200:
                data = response.json()
                print("Sensor Data:", data)
            else:
                print("Error fetching data, status code:", response.status_code)
        except requests.exceptions.RequestException as e:
            print("Request failed:", e)
        
        time.sleep(5)  # Fetch data every 5 seconds

if __name__ == "__main__":
    fetch_sensor_data()
