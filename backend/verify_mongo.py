from pymongo import MongoClient

client = MongoClient('mongodb://localhost:27017/', serverSelectionTimeoutMS=5000)
db = client['iot_anomaly_db']

print('=== MONGODB STORAGE VERIFICATION ===')
print()

cols = db.list_collection_names()
print(f'Collections found: {cols}')
print()

td_count = db.training_data.count_documents({})
print(f'training_data collection: {td_count} documents')
sample = db.training_data.find_one({}, {'_id': 0})
if sample:
    print(f'  Sample record keys: {list(sample.keys())}')
print()

users_count = db.users.count_documents({})
print(f'users collection: {users_count} registered users')
for u in db.users.find({}, {'username': 1, 'role': 1, 'email': 1, '_id': 0}):
    name = u.get('username', '?')
    role = u.get('role', '?')
    email = u.get('email', 'N/A')
    print(f'  - @{name} | role={role} | email={email}')
print()

pred_count = db.predictions.count_documents({})
print(f'predictions collection: {pred_count} stored predictions')
if pred_count > 0:
    last = db.predictions.find_one(
        sort=[('timestamp', -1)],
        projection={'_id': 0, 'username': 1, 'status': 1, 'score': 1, 'timestamp': 1}
    )
    print(f'  Latest prediction: {last}')

print()
print('=== VERIFICATION COMPLETE ===')
