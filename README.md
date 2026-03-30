# 🛡️ AstraGuard: IoT Network Anomaly Detection Platform

A full-stack, enterprise-grade AI Cybersecurity web application. This platform utilizes a Machine Learning model (Random Forest) to analyze live incoming IoT network parameters, immediately scoring them as "Normal" or "Suspicious" cyber attacks.

## 🚀 Features
- **Machine Learning Integration:** Real-time Python-based ML Pipeline evaluating 8 distinct networking features (Packet Size, Flow Duration, Entropy, etc).
- **Role-Based Access Control (RBAC):** Token-based authentication creating strict boundary logic between Global Administrators and standard edge users.
- **Synthwave Cyberpunk Aesthetics:** A highly polished React interface featuring dynamic glassmorphism, floating geometry, neon shadows, and Space Grotesk typography.
- **MongoDB Data Storage:** Direct NoSQL implementation storing User Profiles, encrypted passwords, and aggregate historical network predictions.

## 💻 Tech Stack
- **Frontend UI:** React (`Vite`), raw CSS, `recharts` for data visualization.
- **Backend API:** Python (`Flask`), JWT (`PyJWT`), Password Hashing (`bcrypt`).
- **Database:** MongoDB (`pymongo`)
- **AI/ML Model:** `scikit-learn` (StandardScaler & RandomForestClassifier).

---

## 🔑 Default Seeded Accounts
The system automatically creates these persistent accounts upon starting the server.
| Account Level | Access Type | Username | Password |
|---------------|-------------|----------|----------|
| **Administrator** | Global Analytics & User Database Views | `admin` | `admin` |
| **Standard User** | Private Anomaly Testing Sandbox | `user` | `user` |

---

## ⚙️ How to Run the Project Locally

You must have two terminal windows open to run this application completely.

### 1. Start the Python Backend
This controls the Artificial Intelligence model and the Database.
```powershell
cd backend
python app.py
```
*Expected Output: "Model & DB initialized. Starting Server... Running on http://127.0.0.1:5000"*

### 2. Start the React Frontend
This controls the actual Web User Interface.
```powershell
cd frontend
npm run dev
```
*Expected Output: "VITE v5.1.4 ready in 500 ms... Local: http://localhost:5173/"*

Once both are spinning, simply open **`http://localhost:5173`** in your browser!
