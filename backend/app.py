from flask import Flask, request, jsonify
from flask_cors import CORS
from database import mongo
from ml_model import predict_anomaly, init_model
import os
from functools import wraps
import jwt
import bcrypt
import datetime

app = Flask(__name__)
app.config['SECRET_KEY'] = 'astr_guard_secret_super_key_2026'

CORS(app) 

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token or not token.startswith("Bearer "):
            return jsonify({'message': 'Token is missing or invalid format!'}), 401
            
        token = token.split(" ")[1]
        try:
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
            current_user = mongo.users.find_one({'username': data['username']})
            if not current_user:
                return jsonify({'message': 'Invalid token (User not found)!'}), 401
        except jwt.ExpiredSignatureError:
            return jsonify({'message': 'Token expired!'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'message': 'Token is invalid!'}), 401
            
        return f(current_user, *args, **kwargs)
    return decorated

def seed_database():
    """Seed default Admin and User credentials on boot"""
    if mongo.db is None:
        return
        
    accounts_to_seed = [
        {"username": "admin", "password": b"admin", "role": "admin"},
        {"username": "user", "password": b"user", "role": "user"}
    ]
    
    for acc in accounts_to_seed:
        if not mongo.users.find_one({"username": acc["username"]}):
            hashed = bcrypt.hashpw(acc["password"], bcrypt.gensalt())
            mongo.users.insert_one({
                "username": acc["username"],
                "password": hashed,
                "role": acc["role"],
                "created_at": datetime.datetime.utcnow()
            })
            print(f"[+] Default {acc['role']} account created: {acc['username']}/{acc['password'].decode('utf-8')}")

@app.route('/api/register', methods=['POST'])
def register():
    if mongo.db is None:
        return jsonify({"message": "Database not connected!"}), 500
        
    data = request.json
    username = data.get('username')
    password = data.get('password')
    email = data.get('email', '')
    department = data.get('department', '')
    role = data.get('role', 'user')
    
    if not username or not password:
        return jsonify({"message": "Missing username or password"}), 400
        
    user_exists = mongo.users.find_one({'username': username})
    if user_exists:
        return jsonify({"message": "Username already exists"}), 409
        
    hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
    
    new_user = {
        "username": username,
        "email": email,
        "department": department,
        "password": hashed_password,
        "role": role,
        "created_at": datetime.datetime.utcnow()
    }
    mongo.users.insert_one(new_user)
    
    return jsonify({"message": "User created successfully!", "role": role}), 201

@app.route('/api/login', methods=['POST'])
def login():
    if mongo.db is None:
        return jsonify({"message": "Database not connected!"}), 500
        
    data = request.json
    username = data.get('username')
    password = data.get('password')
    
    if not username or not password:
        return jsonify({"message": "Missing username or password"}), 400
        
    user = mongo.users.find_one({'username': username})
    
    if not user or not bcrypt.checkpw(password.encode('utf-8'), user['password']):
        return jsonify({"message": "Invalid credentials!"}), 401
        
    token = jwt.encode({
        'username': user['username'],
        'role': user['role'],
        'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
    }, app.config['SECRET_KEY'], algorithm="HS256")
    
    return jsonify({
        "token": token,
        "role": user['role'],
        "username": user['username']
    })

@app.route('/api/stats', methods=['GET'])
@token_required
def get_stats(current_user):
    if current_user['role'] != 'admin':
        return jsonify({"message": "Unauthorized access. Admins only."}), 403
        
    total_predictions = mongo.predictions.count_documents({})
    total_anomalies = mongo.predictions.count_documents({'label': 1})
    
    rate = 0
    if total_predictions > 0:
        rate = (total_anomalies / total_predictions) * 100
        
    return jsonify({
        "status": "online",
        "total_predictions": total_predictions,
        "total_anomalies": total_anomalies,
        "anomaly_rate_percent": round(rate, 2)
    })

@app.route('/api/users', methods=['GET'])
@token_required
def get_all_users(current_user):
    if current_user['role'] != 'admin':
        return jsonify({"message": "Unauthorized access. Admins only."}), 403
        
    users_cursor = mongo.users.find().sort("created_at", -1)
    
    users = []
    for u in users_cursor:
        u['_id'] = str(u['_id'])
        u.pop('password', None) # DO NOT return password hash
        if 'created_at' in u:
            u['created_at'] = u['created_at'].strftime('%Y-%m-%d %H:%M:%S')
        users.append(u)
        
    return jsonify(users)

@app.route('/api/history', methods=['GET'])
@token_required
def get_history(current_user):
    if current_user['role'] == 'admin':
        history_cursor = mongo.predictions.find().sort("timestamp", -1).limit(50)
    else:
        history_cursor = mongo.predictions.find({"username": current_user['username']}).sort("timestamp", -1).limit(50)
        
    history = []
    for h in history_cursor:
        h['_id'] = str(h['_id'])
        h['timestamp'] = h['timestamp'].strftime('%Y-%m-%d %H:%M:%S')
        history.append(h)
        
    return jsonify(history)

@app.route('/api/predict', methods=['POST'])
@token_required
def make_prediction(current_user):
    data = request.json
    
    features = {
        'packet_count': data.get('packet_count', 0),
        'byte_count': data.get('byte_count', 0),
        'flow_duration': data.get('flow_duration', 0),
        'avg_packet_size': data.get('avg_packet_size', 0),
        'syn_count': data.get('syn_count', 0),
        'udp_ratio': data.get('udp_ratio', 0),
        'dst_port_entropy': data.get('dst_port_entropy', 0),
        'conn_frequency': data.get('conn_frequency', 0)
    }
    
    prediction_result = dict(predict_anomaly(features))
    
    new_prediction = {
        "username": current_user['username'],
        "timestamp": datetime.datetime.utcnow(),
        "packet_count": features['packet_count'],
        "byte_count": features['byte_count'],
        "flow_duration": features['flow_duration'],
        "avg_packet_size": features['avg_packet_size'],
        "syn_count": features['syn_count'],
        "udp_ratio": features['udp_ratio'],
        "dst_port_entropy": features['dst_port_entropy'],
        "conn_frequency": features['conn_frequency'],
        "label": prediction_result['label'],
        "score": prediction_result['score'],
        "status": prediction_result['status'],
        "alert_level": prediction_result['alert_level']
    }
    
    mongo.predictions.insert_one(new_prediction)
    
    return jsonify({
        "features_received": features,
        "prediction": prediction_result
    }), 201

if __name__ == '__main__':
    print("[+] Initializing Machine Learning Model on Startup...")
    init_model()
    print("[+] Running Database Seeder...")
    seed_database()
    print("[+] Model & DB initialized. Starting Server...")
    app.run(host='0.0.0.0', port=5000, threaded=True)
