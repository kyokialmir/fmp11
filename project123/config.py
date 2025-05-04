import os
from dotenv import load_dotenv
import os

load_dotenv()
SECRET_KEY = os.getenv("SECRET_KEY", "fallback_default_key")

BASE_DIR = os.path.abspath(os.path.dirname(__file__))

# Main database for users, IPs, and temporary scraped data
MAIN_DB_URI = 'sqlite:///' + os.path.join(BASE_DIR, 'main.db')

# Job settings
SCRAPING_INTERVAL = 5        # seconds between each scrape
TEMP_DATA_DURATION = 3600    # seconds to hold temporary data (1 hour)
