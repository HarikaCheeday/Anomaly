import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, Lock } from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';

const UserDatabase = ({ auth }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        if (auth.role !== 'admin') return;
        const response = await axios.get(`${API_BASE}/users`, {
           headers: { Authorization: `Bearer ${auth.token}` }
        });
        setUsers(response.data);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUsers();
  }, [auth.token, auth.role]);

  if (auth.role !== 'admin') {
     return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', flexDirection: 'column', gap: '1rem' }}>
           <Lock color="var(--danger)" size={64} />
           <h2 style={{ color: 'var(--danger)' }}>Access Restricted</h2>
           <p>You must be an Administrator to view the Database User Directory.</p>
        </div>
     );
  }

  if (loading) return <div>Loading User Database...</div>;

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ padding: '0.75rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '12px', color: '#3b82f6' }}>
             <Users size={28} />
          </div>
          <div>
              <h1 style={{ marginBottom: 0 }}>User Database</h1>
              <p style={{ margin: 0 }}>Manage and view all registered platform accounts</p>
          </div>
      </div>

      <div className="glass-panel" style={{ padding: '1rem', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '700px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--glass-border)', color: 'var(--text-secondary)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              <th style={{ padding: '1rem' }}>Username</th>
              <th style={{ padding: '1rem' }}>Email Address</th>
              <th style={{ padding: '1rem' }}>Department</th>
              <th style={{ padding: '1rem' }}>Role</th>
              <th style={{ padding: '1rem' }}>Registration Date</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, idx) => (
              <tr key={user._id || idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', transition: 'background 0.2s' }} className="hover-row">
                <td style={{ padding: '1rem', fontWeight: 600, color: 'white' }}>@{user.username}</td>
                <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{user.email || 'N/A'}</td>
                <td style={{ padding: '1rem', color: 'var(--text-tertiary)' }}>{user.department || 'N/A'}</td>
                <td style={{ padding: '1rem' }}>
                   <span style={{ 
                       padding: '0.25rem 0.75rem', 
                       borderRadius: '12px', 
                       fontSize: '0.75rem',
                       fontWeight: 600,
                       background: user.role === 'admin' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(59, 130, 246, 0.15)',
                       color: user.role === 'admin' ? '#ef4444' : '#3b82f6',
                       border: `1px solid ${user.role === 'admin' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(59, 130, 246, 0.3)'}`
                   }}>
                      {user.role.toUpperCase()}
                   </span>
                </td>
                <td style={{ padding: '1rem', color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>{user.created_at || 'Pre-Alpha Setup'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <style dangerouslySetInnerHTML={{__html: `
         .hover-row:hover { background: rgba(255, 255, 255, 0.03); }
      `}} />
    </div>
  );
};

export default UserDatabase;
