from apscheduler.schedulers.background import BackgroundScheduler
from tasks import scrape_data, process_temporary_data
from config import SCRAPING_INTERVAL

def start_scheduler():
    scheduler = BackgroundScheduler()
    # Job to scrape data every SCRAPING_INTERVAL seconds.
    scheduler.add_job(scrape_data, 'interval', seconds=SCRAPING_INTERVAL, id='scrape_job')
    # Job to process temporary data every hour.
    scheduler.add_job(process_temporary_data, 'interval', minutes=60, id='process_job')
    scheduler.start()
