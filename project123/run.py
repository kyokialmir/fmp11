from flask import Flask, jsonify, request, session
from authentication import auth_bp, login_required, admin_required
from werkzeug.middleware.proxy_fix import ProxyFix

from flask_cors import CORS
from scraper import start_scraper
from anomaly_detection import start_per_ip_anomaly_training
import db
import models

app = Flask(__name__)
CORS(app)
app.secret_key = 'your_secret_key'  # Replace with a strong secret in production
app.wsgi_app = ProxyFix(app.wsgi_app)
app.register_blueprint(auth_bp, url_prefix='/api/auth')


if __name__ == '__main__':
    # Start background scraping and processing jobs.
    start_scraper()
    start_per_ip_anomaly_training()
    # Run the Flask app.
    app.run(host='0.0.0.0', port=5000, debug=True, use_reloader=False)
