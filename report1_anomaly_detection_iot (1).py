"""
==============================================================================
ANOMALY DETECTION IN IoT NETWORKS USING MACHINE LEARNING ALGORITHMS
Student: CH Harika Durga
==============================================================================
This implementation demonstrates IoT network anomaly detection using
Random Forest (supervised) and Isolation Forest (unsupervised) algorithms.
"""

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier, IsolationForest
from sklearn.metrics import classification_report, accuracy_score, confusion_matrix, roc_curve, auc
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import seaborn as sns
import warnings
warnings.filterwarnings('ignore')

# ============================================================
# 1. SYNTHETIC IoT NETWORK TRAFFIC DATA GENERATION
# ============================================================
print("=" * 70)
print("  ANOMALY DETECTION IN IoT NETWORKS USING ML ALGORITHMS")
print("  Student: CH Harika Durga | MCA 2024-2025")
print("=" * 70)

np.random.seed(42)
n_normal = 800
n_anomaly = 200

# Normal traffic features
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

# Anomalous traffic features (higher packet counts, bursts, etc.)
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
data.to_csv("iot_network_data.csv", index=False)

print("\n[+] Dataset generated: 1000 IoT traffic windows (800 normal, 200 anomaly)")
print(f"[+] Saved to: iot_network_data.csv")
print(f"\nDataset Shape: {data.shape}")
print(f"\nClass Distribution:\n{data['label'].value_counts().to_string()}")
print(f"\nFeature Statistics:\n{data.describe().round(2).to_string()}")

# ============================================================
# 2. FEATURE SELECTION AND PREPROCESSING
# ============================================================
print("\n" + "=" * 70)
print("  PHASE 2: FEATURE SELECTION & PREPROCESSING")
print("=" * 70)

features = ["packet_count", "byte_count", "flow_duration", "avg_packet_size",
            "syn_count", "udp_ratio", "dst_port_entropy", "conn_frequency"]
X = data[features]
y = data["label"]

scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

X_train, X_test, y_train, y_test = train_test_split(
    X_scaled, y, test_size=0.2, random_state=42, stratify=y
)

print(f"[+] Features selected: {len(features)}")
print(f"[+] Training set: {X_train.shape[0]} samples")
print(f"[+] Testing set:  {X_test.shape[0]} samples")
print(f"[+] Feature scaling: StandardScaler applied")

# ============================================================
# 3. RANDOM FOREST CLASSIFIER (SUPERVISED)
# ============================================================
print("\n" + "=" * 70)
print("  PHASE 3: RANDOM FOREST MODEL TRAINING & EVALUATION")
print("=" * 70)

rf_model = RandomForestClassifier(n_estimators=150, max_depth=10, random_state=42)
rf_model.fit(X_train, y_train)
rf_pred = rf_model.predict(X_test)
rf_proba = rf_model.predict_proba(X_test)[:, 1]

rf_accuracy = accuracy_score(y_test, rf_pred)
print(f"\n[+] Random Forest Accuracy: {rf_accuracy:.4f}")
print(f"\nClassification Report (Random Forest):")
print(classification_report(y_test, rf_pred, target_names=["Normal", "Anomaly"]))

# ============================================================
# 4. ISOLATION FOREST (UNSUPERVISED)
# ============================================================
print("=" * 70)
print("  PHASE 4: ISOLATION FOREST (UNSUPERVISED DETECTION)")
print("=" * 70)

iso_model = IsolationForest(contamination=0.2, random_state=42, n_estimators=100)
iso_model.fit(X_scaled)
iso_pred_raw = iso_model.predict(X_scaled)
iso_pred = [1 if p == -1 else 0 for p in iso_pred_raw]
iso_scores = iso_model.decision_function(X_scaled)

iso_accuracy = accuracy_score(y, iso_pred)
print(f"\n[+] Isolation Forest Accuracy: {iso_accuracy:.4f}")
print(f"\nClassification Report (Isolation Forest):")
print(classification_report(y, iso_pred, target_names=["Normal", "Anomaly"]))

# ============================================================
# 5. REAL-TIME PREDICTION FUNCTION
# ============================================================
print("=" * 70)
print("  PHASE 5: REAL-TIME PREDICTION DEMO")
print("=" * 70)

def predict_window(packet_count, byte_count, flow_duration,
                   avg_packet_size, syn_count, udp_ratio,
                   dst_port_entropy, conn_frequency):
    row = [[packet_count, byte_count, flow_duration, avg_packet_size,
            syn_count, udp_ratio, dst_port_entropy, conn_frequency]]
    row_scaled = scaler.transform(row)
    label = rf_model.predict(row_scaled)[0]
    probability = rf_model.predict_proba(row_scaled)[0][1]
    return label, probability

# Test with suspicious traffic window
test_cases = [
    ("Suspicious Traffic", 820, 59000, 3.8, 72.1, 105, 0.15, 0.84, 18),
    ("Normal Traffic", 145, 11500, 5.2, 82.0, 8, 0.32, 0.38, 4),
    ("Border Case", 400, 30000, 3.0, 75.0, 50, 0.20, 0.60, 10),
]

for name, *params in test_cases:
    label, score = predict_window(*params)
    status = "SUSPICIOUS" if label == 1 else "NORMAL"
    print(f"\n  [{name}]")
    print(f"    Prediction: {status}")
    print(f"    Anomaly Score: {score:.4f}")
    print(f"    Alert Level: {'HIGH' if score > 0.7 else 'MEDIUM' if score > 0.4 else 'LOW'}")

# ============================================================
# 6. VISUALIZATION & DASHBOARD GENERATION
# ============================================================
print("\n" + "=" * 70)
print("  PHASE 6: GENERATING VISUALIZATIONS")
print("=" * 70)

fig, axes = plt.subplots(2, 3, figsize=(18, 12))
fig.suptitle("IoT Network Anomaly Detection - Dashboard", fontsize=16, fontweight='bold')

# 1. Confusion Matrix
cm = confusion_matrix(y_test, rf_pred)
sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', ax=axes[0, 0],
            xticklabels=["Normal", "Anomaly"], yticklabels=["Normal", "Anomaly"])
axes[0, 0].set_title("Confusion Matrix (Random Forest)")
axes[0, 0].set_ylabel("Actual")
axes[0, 0].set_xlabel("Predicted")

# 2. ROC Curve
fpr, tpr, _ = roc_curve(y_test, rf_proba)
roc_auc = auc(fpr, tpr)
axes[0, 1].plot(fpr, tpr, 'b-', linewidth=2, label=f'RF (AUC={roc_auc:.3f})')
axes[0, 1].plot([0, 1], [0, 1], 'r--')
axes[0, 1].set_title("ROC Curve")
axes[0, 1].set_xlabel("False Positive Rate")
axes[0, 1].set_ylabel("True Positive Rate")
axes[0, 1].legend()

# 3. Feature Importance
importances = rf_model.feature_importances_
sorted_idx = np.argsort(importances)
axes[0, 2].barh(range(len(features)), importances[sorted_idx], color='steelblue')
axes[0, 2].set_yticks(range(len(features)))
axes[0, 2].set_yticklabels([features[i] for i in sorted_idx])
axes[0, 2].set_title("Feature Importance (Random Forest)")

# 4. Traffic Distribution
axes[1, 0].hist(data[data['label'] == 0]['packet_count'], bins=30, alpha=0.6, color='green', label='Normal')
axes[1, 0].hist(data[data['label'] == 1]['packet_count'], bins=30, alpha=0.6, color='red', label='Anomaly')
axes[1, 0].set_title("Packet Count Distribution")
axes[1, 0].set_xlabel("Packet Count")
axes[1, 0].legend()

# 5. Anomaly Score Distribution (Isolation Forest)
axes[1, 1].hist(iso_scores[y == 0], bins=30, alpha=0.6, color='green', label='Normal')
axes[1, 1].hist(iso_scores[y == 1], bins=30, alpha=0.6, color='red', label='Anomaly')
axes[1, 1].set_title("Isolation Forest Anomaly Scores")
axes[1, 1].set_xlabel("Decision Score")
axes[1, 1].legend()

# 6. Traffic Trend Simulation
time_steps = np.arange(100)
normal_trend = np.random.normal(150, 20, 100)
normal_trend[60:75] = np.random.normal(700, 100, 15)  # Anomaly burst
colors = ['red' if 60 <= i < 75 else 'green' for i in time_steps]
axes[1, 2].bar(time_steps, normal_trend, color=colors, width=1.0)
axes[1, 2].set_title("Traffic Trend (Anomaly Burst at t=60-75)")
axes[1, 2].set_xlabel("Time Window")
axes[1, 2].set_ylabel("Packet Count")

plt.tight_layout()
plt.savefig("anomaly_detection_dashboard.png", dpi=150, bbox_inches='tight')
print("[+] Dashboard saved: anomaly_detection_dashboard.png")

# Model comparison summary
fig2, ax = plt.subplots(figsize=(8, 5))
models = ['Random Forest', 'Isolation Forest']
accuracies = [rf_accuracy * 100, iso_accuracy * 100]
bars = ax.bar(models, accuracies, color=['#2196F3', '#FF9800'], width=0.5)
for bar, acc in zip(bars, accuracies):
    ax.text(bar.get_x() + bar.get_width() / 2., bar.get_height() + 0.5,
            f'{acc:.1f}%', ha='center', fontsize=14, fontweight='bold')
ax.set_ylim(0, 105)
ax.set_ylabel("Accuracy (%)")
ax.set_title("Model Comparison - Anomaly Detection Accuracy")
plt.tight_layout()
plt.savefig("model_comparison.png", dpi=150, bbox_inches='tight')
print("[+] Model comparison saved: model_comparison.png")

print("\n" + "=" * 70)
print("  EXECUTION COMPLETE - All modules tested successfully")
print("=" * 70)
