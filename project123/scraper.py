import time
import requests
from threading import Thread
from db import TempSessionLocal, MainSessionLocal
from models import IPAddress, TempScrapedData, ScrapedData
from anomaly_detection import detect_anomalies

print(f"🔍 Scraper connected to: {MainSessionLocal().bind.url}")

def scrape_ip(ip):
    """ Fetch data from an IP address. """
    try:
        response = requests.get(ip, timeout=3)
        if response.status_code == 200:
            return response.json()
    except requests.RequestException as e:
        print(f"Error scraping {ip}: {e}")
    return None

def scrape_all_ips():
    """ Continuously scrape data and store it in the temporary database. """
    while True:
        try:
            temp_db = MainSessionLocal()
            ips = temp_db.query(IPAddress).all()

            if not ips:
                print("⚠️ No IP addresses found in the database!")

            for ip_entry in ips:
                data = scrape_ip(ip_entry.ip)
                if data:
                    temp_db.add(TempScrapedData(ip=ip_entry.ip, data=data))

            temp_db.commit()
            temp_db.close()
        except Exception as e:
            print(f"❌ Scraper error: {e}")
        time.sleep(5)  # ✅ Scrape every 5 seconds to avoid infinite CPU usage

def process_temporary_data():
    """ Move data from temporary DB to permanent DB every 10 minutes. """
    while True:
        try:
            temp_db = TempSessionLocal()
            main_db = MainSessionLocal()

            temp_data_entries = main_db.query(TempScrapedData).all()
            for entry in temp_data_entries:
                anomaly_status = 1 if detect_anomalies(entry.data, entry.ip) else 0
                processed_entry = ScrapedData(ip=entry.ip, data=entry.data, anomaly=anomaly_status)
                main_db.add(processed_entry)

            main_db.commit()
            main_db.query(TempScrapedData).delete()
            temp_db.commit()

            temp_db.close()
            main_db.close()
        except Exception as e:
            print(f"❌ Data processing error: {e}")
        time.sleep(10)  # ✅ Process every 10 minutes

def start_scraper():
    """ Start scraper and data processor as background threads. """
    Thread(target=scrape_all_ips, daemon=True).start()  # ✅ Daemonized
    Thread(target=process_temporary_data, daemon=True).start()  # ✅ Daemonized
