import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { ShieldAlert, UserPlus } from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';

const Register = () => {
  const [formData, setFormData] = useState({
     username: '',
     email: '',
     department: '',
     password: '',
     role: 'user'
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      await axios.post(`${API_BASE}/register`, formData);
      setSuccess('Account created successfully! Please login.');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      if (err.response && err.response.data) {
        setError(err.response.data.message);
      } else {
        setError("Network error. Is the backend and MongoDB running?");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', width: '100vw' }}>
      <div className="glass-panel fade-in" style={{ width: '450px', maxWidth: '90%' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div className="pulse" style={{
            width: '60px',
            height: '60px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 15px rgba(59, 130, 246, 0.4)',
            margin: '0 auto 1rem auto'
          }}>
            <ShieldAlert color="white" size={32} />
          </div>
          <h1>AstraGuard</h1>
          <p>Create a New Platform Account</p>
        </div>
        
        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '0.75rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
            {error}
          </div>
        )}

        {success && (
          <div style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '0.75rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
            {success}
          </div>
        )}
        
        <form onSubmit={handleRegister}>
          <div className="grid-2" style={{ gap: '0 1rem', marginBottom: '-0.5rem' }}>
             <div className="input-group">
                <label className="input-label">Username</label>
                <input type="text" name="username" className="input-field" value={formData.username} onChange={handleInputChange} required />
             </div>
             <div className="input-group">
                <label className="input-label">Department</label>
                <input type="text" name="department" className="input-field" value={formData.department} onChange={handleInputChange} placeholder="e.g. IT, Security" />
             </div>
          </div>
          
          <div className="input-group">
            <label className="input-label">Email Address</label>
            <input type="email" name="email" className="input-field" value={formData.email} onChange={handleInputChange} required />
          </div>
          <div className="input-group">
            <label className="input-label">Password</label>
            <input type="password" name="password" className="input-field" value={formData.password} onChange={handleInputChange} required />
          </div>
          <div className="input-group">
            <label className="input-label">Account Type</label>
            <select name="role" className="input-field" value={formData.role} onChange={handleInputChange}>
              <option value="user">Standard User (Network Prediction Only)</option>
              <option value="admin">Administrator (Global Analytics & DB Access)</option>
            </select>
          </div>
          
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={loading}>
             {loading ? 'Processing...' : <><UserPlus size={20}/> Complete Registration</>}
          </button>
        </form>
        
        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--accent-primary)', textDecoration: 'none' }}>Login here</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
