import jwt
import datetime
from flask import Blueprint, request, jsonify, session
from db import MainSessionLocal
from models import User
from werkzeug.security import check_password_hash
from flask_cors import CORS
from functools import wraps
from config import SECRET_KEY
from werkzeug.security import generate_password_hash 
from models import User, IPAddress, ScrapedData
from flask import request
from utils import decode_jwt_token 


auth_bp = Blueprint('auth', __name__)
CORS(auth_bp, supports_credentials=True, origins=["http://localhost:3000"])

@auth_bp.route("/user/ips", methods=["GET"])
def get_user_ips():
    """Returns only the IPs assigned to the logged-in user."""
    token = request.headers.get("Authorization")
    if not token:
        return jsonify({"error": "Missing token"}), 401

    decoded_user = decode_jwt_token(token)
    if not decoded_user:
        return jsonify({"error": "Invalid token"}), 403

    username = decoded_user.get("sub", None)
    if username is None:
        return jsonify({"error": "Missing username in token"}), 400
    db_session = MainSessionLocal()
    
    # Find the user
    user = db_session.query(User).filter_by(username=username).first()
    if not user:
        db_session.close()
        return jsonify({"error": "User not found"}), 404

    # Get all IPs assigned to this user
    user_ips = db_session.query(IPAddress).filter_by(user_id=user.id).all()
    ip_list = [{"id": ip.id, "ip": ip.ip} for ip in user_ips]

    db_session.close()
    return jsonify(ip_list), 200

@auth_bp.route('/user/scraped-data', methods=['GET'])
def get_user_scraped_data():
    token = request.headers.get("Authorization")
    if not token:
        return jsonify({"error": "Missing token"}), 401

    decoded_user = decode_jwt_token(token)
    if not decoded_user:
        return jsonify({"error": "Invalid token"}), 403

    username = decoded_user.get("sub", None)
    if username is None:
        return jsonify({"error": "Missing username in token"}), 400
    db_session = MainSessionLocal()

    user = db_session.query(User).filter_by(username=username).first()
    if not user:
        db_session.close()
        return jsonify({"error": "User not found"}), 404

    user_ips = db_session.query(IPAddress).filter_by(user_id=user.id).all()
    ip_list = [ip_entry.ip for ip_entry in user_ips]

    data_entries = db_session.query(ScrapedData).filter(ScrapedData.ip.in_(ip_list)).order_by(ScrapedData.timestamp.desc()).limit(50).all()

    result = [
        {"ip": entry.ip, "data": entry.data, "anomaly": entry.anomaly, "timestamp": entry.timestamp.strftime("%Y-%m-%d %H:%M:%S")}
        for entry in data_entries
    ]

    db_session.close()
    return jsonify(result), 200

def generate_jwt_token(username):
    """
    Generate a JWT token for the user.
    """
    expiration_time = datetime.datetime.utcnow() + datetime.timedelta(hours=2)
    payload = {"sub": username, "exp": expiration_time}
    return jwt.encode(payload, SECRET_KEY, algorithm="HS256")

@auth_bp.route('/admin/users', methods=['GET'])
def get_all_users():
    """
    Returns all users with their assigned IPs.
    """
    db_session = MainSessionLocal()
    users = db_session.query(User).all()
    
    users_data = []
    for user in users:
        users_data.append({
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role,
            "ips": [ip.ip for ip in user.ips]  # List of assigned IPs
        })
    
    db_session.close()
    return jsonify(users_data), 200

@auth_bp.route('/admin/assign-ip', methods=['POST'])
def assign_ip_to_user():
    """
    Admin can assign an IP to a user.
    Expected JSON: { "username": "user1", "ip": "192.168.1.100" }
    """
    data = request.get_json()
    username = data.get("username")
    ip = data.get("ip")

    if not username or not ip:
        return jsonify({"error": "Username and IP required"}), 400

    db_session = MainSessionLocal()
    user = db_session.query(User).filter_by(username=username).first()

    if not user:
        db_session.close()
        return jsonify({"error": "User not found"}), 404

    existing_ip = db_session.query(IPAddress).filter_by(ip=ip).first()
    if existing_ip:
        db_session.close()
        return jsonify({"error": "IP already assigned"}), 400

    new_ip = IPAddress(ip=ip, user_id=user.id)
    db_session.add(new_ip)
    db_session.commit()
    db_session.close()

    return jsonify({"message": f"IP {ip} assigned to {username} successfully"}), 201

@auth_bp.route('/admin/create-user', methods=['POST'])
def create_user():
    """
    Admin can create a new user and optionally assign IPs.
    Expected JSON: { "username": "user1", "email": "user@example.com", "full_name": "User Name", "password": "securepass", "ips": ["192.168.1.1", "192.168.1.2"] }
    """
    data = request.get_json()
    username = data.get("username")
    email = data.get("email")
    full_name = data.get("full_name")
    password = data.get("password")
    ips = data.get("ips", [])  # Optional list of IPs

    if not username or not email or not full_name or not password:
        return jsonify({"error": "Missing user details"}), 400

    db_session = MainSessionLocal()

    if db_session.query(User).filter_by(username=username).first():
        db_session.close()
        return jsonify({"error": "Username already exists"}), 400

    hashed_password = generate_password_hash(password)
    new_user = User(username=username, email=email, full_name=full_name, password=hashed_password, role="regular")
    db_session.add(new_user)
    db_session.commit()

    # Assign IPs if provided
    for ip in ips:
        new_ip = IPAddress(ip=ip, user_id=new_user.id)
        db_session.add(new_ip)

    db_session.commit()
    db_session.close()

    return jsonify({"message": f"User {username} created successfully"}), 201

@auth_bp.route('/register-admin', methods=['POST'])
def register_admin():
    """
    Only allow an initial admin to be registered manually.
    """
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")

    if not username or not password:
        return jsonify({"error": "Missing username or password"}), 400

    db_session = MainSessionLocal()
    
    # Check if an admin already exists
    existing_admin = db_session.query(User).filter_by(role="admin").first()
    if existing_admin:
        db_session.close()
        return jsonify({"error": "Admin already exists"}), 403

    hashed_password = generate_password_hash(password)
    admin_user = User(username=username, password=hashed_password, role="admin")

    db_session.add(admin_user)
    db_session.commit()
    db_session.close()

    return jsonify({"message": "Admin registered successfully"}), 201


@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")

    db_session = MainSessionLocal()
    user = db_session.query(User).filter_by(username=username).first()
    db_session.close()

    if not user or not check_password_hash(user.password, password):
        return jsonify({"error": "Invalid credentials"}), 401

    # Generate JWT Token
    token = generate_jwt_token(username)

    return jsonify({
        "access_token": token,
        "token_type": "Bearer",
        "role": user.role,  # ✅ Include the role in the response
        "username": user.username  # ✅ Include username for frontend storage
    }), 200

@auth_bp.route('/logout', methods=['POST'])
def logout():
    session.pop('user', None)
    return jsonify({"message": "Logged out successfully"}), 200

def login_required(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        if 'user' not in session:
            return jsonify({"error": "Authentication required"}), 401
        return func(*args, **kwargs)
    return wrapper

def admin_required(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        if 'user' not in session:
            return jsonify({"error": "Authentication required"}), 401
        db_session = MainSessionLocal()
        user = db_session.query(User).filter_by(username=session['user']).first()
        db_session.close()
        if not user or user.role != 'admin':
            return jsonify({"error": "Admin access required"}), 403
        return func(*args, **kwargs)
    return wrapper


def login_required(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            return jsonify({"error": "Authentication required"}), 401
        
        token = auth_header.split(" ")[1]

        try:
            decoded_token = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
            request.user = decoded_token["sub"]
        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Token expired"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"error": "Invalid token"}), 401

        return func(*args, **kwargs)
    
    return wrapper


