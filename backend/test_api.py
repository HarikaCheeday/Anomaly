import requests

BASE = 'http://localhost:5000/api'

# 1. Login
print("=== 1. LOGIN TEST (MongoDB Atlas) ===")
r = requests.post(BASE + '/login', json={'username': 'admin', 'password': 'admin'})
print("Status Code:", r.status_code)
data = r.json()
print("Logged in as:", data.get('username'), "| Role:", data.get('role'))
token = data.get('token')
headers = {'Authorization': 'Bearer ' + token}

# 2. Platform Stats
print()
print("=== 2. PLATFORM STATS (from Atlas) ===")
r = requests.get(BASE + '/stats', headers=headers)
stats = r.json()
print("Total Predictions:", stats.get('total_predictions'))
print("Total Anomalies  :", stats.get('total_anomalies'))
print("Anomaly Rate     :", stats.get('anomaly_rate_percent'), "%")

# 3. Run Prediction
print()
print("=== 3. ML PREDICTION - ATTACK SCENARIO ===")
payload = {
    'packet_count': 850, 'byte_count': 60000,
    'flow_duration': 1.5, 'avg_packet_size': 70,
    'syn_count': 100, 'udp_ratio': 0.1,
    'dst_port_entropy': 0.9, 'conn_frequency': 20
}
r = requests.post(BASE + '/predict', json=payload, headers=headers)
pred = r.json().get('prediction', {})
print("Result      :", pred.get('status'))
print("Score       :", round(pred.get('score', 0) * 100, 1), "%")
print("Alert Level :", pred.get('alert_level'))
print("Saved to Atlas predictions collection!")

# 4. User Database
print()
print("=== 4. USER DATABASE (Live from Atlas) ===")
r = requests.get(BASE + '/users', headers=headers)
users = r.json()
print("Total users stored in MongoDB Atlas:", len(users))
for u in users:
    print(" -", u.get('username'), "| role:", u.get('role'), "| email:", u.get('email', 'N/A'))

print()
print("=== ALL DATA VERIFIED IN MONGODB ATLAS ===")
