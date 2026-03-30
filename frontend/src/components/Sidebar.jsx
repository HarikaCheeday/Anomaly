import React from 'react';
import { NavLink } from 'react-router-dom';
import { ShieldAlert, LayoutDashboard, ActivitySquare, Settings, LogOut, User, Users } from 'lucide-react';

const Sidebar = ({ auth, handleLogout }) => {
  return (
    <aside style={{
      width: 'var(--sidebar-width)',
      height: '100vh',
      position: 'fixed',
      left: 0,
      top: 0,
      background: 'rgba(19, 20, 28, 0.8)',
      backdropFilter: 'blur(16px)',
      borderRight: '1px solid var(--glass-border)',
      display: 'flex',
      flexDirection: 'column',
      padding: '2rem 1.5rem',
      zIndex: 100
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '3rem' }}>
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '10px',
          background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 15px rgba(139, 92, 246, 0.4)'
        }}>
          <ShieldAlert color="white" size={24} />
        </div>
        <div>
          <h2 style={{ fontSize: '1.25rem', marginBottom: 0, background: 'linear-gradient(135deg, #fff, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            AstraGuard
          </h2>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>IoT Anomaly Detection</span>
        </div>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
        <NavLink to="/dashboard" style={({ isActive }) => ({
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          padding: '0.875rem 1rem',
          borderRadius: '8px',
          color: isActive ? 'white' : 'var(--text-secondary)',
          background: isActive ? 'rgba(139, 92, 246, 0.15)' : 'transparent',
          border: isActive ? '1px solid rgba(139, 92, 246, 0.3)' : '1px solid transparent',
          textDecoration: 'none',
          fontWeight: 500,
          transition: 'all 0.2s ease'
        })}>
          <LayoutDashboard size={20} />
          Dashboard
        </NavLink>

        <NavLink to="/predictor" style={({ isActive }) => ({
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          padding: '0.875rem 1rem',
          borderRadius: '8px',
          color: isActive ? 'white' : 'var(--text-secondary)',
          background: isActive ? 'rgba(139, 92, 246, 0.15)' : 'transparent',
          border: isActive ? '1px solid rgba(139, 92, 246, 0.3)' : '1px solid transparent',
          textDecoration: 'none',
          fontWeight: 500,
          transition: 'all 0.2s ease'
        })}>
          <ActivitySquare size={20} />
          Predictor
        </NavLink>

        {auth.role === 'admin' && (
          <NavLink to="/users" style={({ isActive }) => ({
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            padding: '0.875rem 1rem',
            borderRadius: '8px',
            color: isActive ? 'white' : 'var(--text-secondary)',
            background: isActive ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
            border: isActive ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid transparent',
            textDecoration: 'none',
            fontWeight: 500,
            transition: 'all 0.2s ease'
          })}>
            <Users size={20} />
            User Database
          </NavLink>
        )}
      </nav>

      <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
          <div style={{ background: 'rgba(255,255,255,0.1)', padding: '0.5rem', borderRadius: '50%' }}>
            <User size={20} color="white" />
          </div>
          <div style={{ overflow: 'hidden' }}>
            <p style={{ margin: 0, fontSize: '0.875rem', color: 'white', whiteSpace: 'nowrap', textOverflow: 'ellipsis', fontWeight: 600 }}>@{auth.username}</p>
            <p style={{ margin: 0, fontSize: '0.75rem', color: auth.role === 'admin' ? 'var(--warning)' : 'var(--text-tertiary)' }}>{auth.role === 'admin' ? 'Administrator' : 'Standard User'}</p>
          </div>
        </div>
        
        <button onClick={handleLogout} className="btn" style={{ width: '100%', background: 'transparent', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#f87171' }}>
          <LogOut size={18} /> Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
