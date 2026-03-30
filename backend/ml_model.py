import pandas as pd
import numpy as np
import os
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier
from database import mongo

# Global model variables
scaler = None
rf_model = None

def init_model():
    global scaler, rf_model
    
    if mongo.db is None:
        print("[!] Critical: Cannot attach ML Pipeline to MongoDB. Cluster missing.")
        return
        
    # Generate data directly into the DB if the collection is empty
    doc_count = mongo.db.training_data.count_documents({})
    
    if doc_count == 0:
        print("[+] Local training collection is empty. Hydrating MongoDB cluster...")
        np.random.seed(42)
        n_normal = 800
        n_anomaly = 200

        normal_data = pd.DataFrame({
            'packet_count': np.random.normal(150, 30, n_normal),
            'byte_count': np.random.normal(12000, 2000, n_normal),
            'flow_duration': np.random.normal(5.0, 1.5, n_normal),
            'avg_packet_size': np.random.normal(80, 15, n_normal),
            'syn_count': np.random.normal(10, 3, n_normal),
            'udp_ratio': np.random.normal(0.3, 0.1, n_normal),
            'dst_port_entropy': np.random.normal(0.4, 0.1, n_normal),
            'conn_frequency': np.random.normal(5, 2, n_normal),
            'label': 0
        })

        anomaly_data = pd.DataFrame({
            'packet_count': np.random.normal(800, 150, n_anomaly),
            'byte_count': np.random.normal(58000, 8000, n_anomaly),
            'flow_duration': np.random.normal(2.0, 0.8, n_anomaly),
            'avg_packet_size': np.random.normal(72, 10, n_anomaly),
            'syn_count': np.random.normal(95, 20, n_anomaly),
            'udp_ratio': np.random.normal(0.15, 0.05, n_anomaly),
            'dst_port_entropy': np.random.normal(0.85, 0.1, n_anomaly),
            'conn_frequency': np.random.normal(18, 4, n_anomaly),
            'label': 1
        })

        data = pd.concat([normal_data, anomaly_data], ignore_index=True).sample(frac=1, random_state=42).reset_index(drop=True)
        # Offload 100% of the flat-file dataframe to the database via insert_many
        mongo.db.training_data.insert_many(data.to_dict('records'))
        print(f"[+] Successfully uploaded 1,000 baseline network vectors to MongoDB.")
    else:
        print(f"[+] Pulling {doc_count} training documents from MongoDB Collection...")
        # Stream from mongo straight to pandas bypassing the hard disk
        cursor = mongo.db.training_data.find({}, {'_id': False})
        data = pd.DataFrame(list(cursor))

    print("[+] Training model...")
    features = ["packet_count", "byte_count", "flow_duration", "avg_packet_size",
                "syn_count", "udp_ratio", "dst_port_entropy", "conn_frequency"]
    X = data[features]
    y = data["label"]

    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    X_train, X_test, y_train, y_test = train_test_split(
        X_scaled, y, test_size=0.2, random_state=42, stratify=y
    )

    rf_model = RandomForestClassifier(n_estimators=150, max_depth=10, random_state=42)
    rf_model.fit(X_train, y_train)
    print("[+] Model trained successfully.")

def predict_anomaly(features_dict):
    """
    Predicts if the given IoT network parameters represent an anomaly.
    Returns: label (0/1), probability, and string status
    """
    if scaler is None or rf_model is None:
        init_model()
        
    packet_count = float(features_dict.get('packet_count', 0))
    byte_count = float(features_dict.get('byte_count', 0))
    flow_duration = float(features_dict.get('flow_duration', 0))
    avg_packet_size = float(features_dict.get('avg_packet_size', 0))
    syn_count = float(features_dict.get('syn_count', 0))
    udp_ratio = float(features_dict.get('udp_ratio', 0))
    dst_port_entropy = float(features_dict.get('dst_port_entropy', 0))
    conn_frequency = float(features_dict.get('conn_frequency', 0))

    row = [[packet_count, byte_count, flow_duration, avg_packet_size,
            syn_count, udp_ratio, dst_port_entropy, conn_frequency]]
            
    row_scaled = scaler.transform(row)
    label = int(rf_model.predict(row_scaled)[0])
    probability = float(rf_model.predict_proba(row_scaled)[0][1])
    
    status = "SUSPICIOUS" if label == 1 else "NORMAL"
    
    return {
        "label": label,
        "score": probability,
        "status": status,
        "alert_level": 'HIGH' if probability > 0.7 else 'MEDIUM' if probability > 0.4 else 'LOW'
    }
