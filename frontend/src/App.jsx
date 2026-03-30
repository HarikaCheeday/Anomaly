import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Predictor from './components/Predictor';
import Login from './components/Login';
import Register from './components/Register';
import UserDatabase from './components/UserDatabase';

function App() {
  const [auth, setAuth] = useState({ token: null, role: null, username: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing token
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const username = localStorage.getItem('username');
    
    if (token) setAuth({ token, role, username });
    setLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('username');
    setAuth({ token: null, role: null, username: null });
  };

  if (loading) return <div>Loading Application...</div>;

  const ProtectedRoute = ({ children }) => {
    if (!auth.token) {
      return <Navigate to="/login" replace />;
    }
    return children;
  };

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login setAuthParams={setAuth} />} />
        <Route path="/register" element={<Register />} />
        
        <Route path="/*" element={
          <ProtectedRoute>
            <div className="app-container">
              <Sidebar auth={auth} handleLogout={handleLogout} />
              <main className="main-content">
                <Routes>
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/dashboard" element={<Dashboard auth={auth} />} />
                  <Route path="/predictor" element={<Predictor auth={auth} />} />
                  <Route path="/users" element={<UserDatabase auth={auth} />} />
                </Routes>
              </main>
            </div>
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;
