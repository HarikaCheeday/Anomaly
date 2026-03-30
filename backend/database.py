from pymongo import MongoClient
import os
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

class MongoDBManager:
    def __init__(self, uri="mongodb://localhost:27017/", db_name="iot_anomaly_db"):
        print(f"[+] Connecting to MongoDB at {uri}...")
        try:
            self.client = MongoClient(uri, serverSelectionTimeoutMS=5000)
            self.client.server_info() # trigger exception if cannot verify connection
            self.db = self.client[db_name]
            
            self.users = self.db['users']
            self.predictions = self.db['predictions']
            
            # Create unique index on username
            self.users.create_index("username", unique=True)
            print("[+] Successfully connected to MongoDB.")
        except Exception as e:
            print(f"[!] Warning: Could not connect to MongoDB. Error: {e}")
            print("[!] Make sure MongoDB is running on localhost:27017 or update the URI.")
            self.db = None
            self.users = None
            self.predictions = None
            
MONGO_URI = os.getenv("MONGO_URI")
mongo = MongoDBManager(uri=MONGO_URI)
