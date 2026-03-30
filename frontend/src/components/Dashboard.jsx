import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from 'recharts';
import { Activity, ShieldAlert, Database, ArrowUpRight, Lock } from 'lucide-react';

const API_BASE = 'https://anomaly-m60v.onrender.com/api';

const Dashboard = ({ auth }) => {
  const [stats, setStats] = useState({ total_predictions: 0, total_anomalies: 0, anomaly_rate_percent: 0 });
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statsError, setStatsError] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const headers = { Authorization: `Bearer ${auth.token}` };
        
        // 1. Fetch History (Available for everyone, but scoped in backend)
        const historyRes = await axios.get(`${API_BASE}/history`, { headers });
        const sortedHistory = historyRes.data.reverse().map((item, idx) => ({
          name: `Req ${idx+1}`,
          score: item.score,
          status: item.status
        }));
        setHistory(sortedHistory);
        
        // 2. Fetch Stats (Only available to admins)
        if (auth.role === 'admin') {
           const statsRes = await axios.get(`${API_BASE}/stats`, { headers });
           setStats(statsRes.data);
           setStatsError(false);
        } else {
           setStatsError(true);
        }
        
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
    const interval = setInterval(fetchData, 5000); // Live update
    return () => clearInterval(interval);
  }, [auth.token, auth.role]);

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>Loading Platform Data...</div>;

  const pieData = [
    { name: 'Normal Traffic', value: stats.total_predictions - stats.total_anomalies },
    { name: 'Anomalies Detected', value: stats.total_anomalies }
  ];
  const COLORS = ['#10b981', '#ef4444']; 

  return (
    <div>
      <h1 style={{ marginBottom: '1.5rem' }}>Overview Dashboard</h1>
      
      {/* Stat Cards - Role Protected */}
      {auth.role === 'admin' ? (
        <div className="grid-3" style={{ marginBottom: '2rem' }}>
          <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ padding: '1rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '12px', color: '#3b82f6' }}>
              <Database size={28} />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '0.875rem' }}>Global Predictions</p>
              <h2 style={{ margin: 0, fontSize: '1.75rem' }}>{stats.total_predictions}</h2>
            </div>
          </div>

          <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div className="pulse" style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '12px', color: '#ef4444' }}>
              <ShieldAlert size={28} />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '0.875rem' }}>Global Anomalies</p>
              <h2 style={{ margin: 0, fontSize: '1.75rem' }}>{stats.total_anomalies}</h2>
            </div>
          </div>

          <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ padding: '1rem', background: 'rgba(139, 92, 246, 0.1)', borderRadius: '12px', color: '#8b5cf6' }}>
              <Activity size={28} />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '0.875rem' }}>Anomaly Rate</p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                <h2 style={{ margin: 0, fontSize: '1.75rem' }}>{stats.anomaly_rate_percent}%</h2>
                {stats.anomaly_rate_percent > 10 && <ArrowUpRight size={20} color="#ef4444" />}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="glass-panel" style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem', background: 'var(--bg-secondary)' }}>
           <Lock color="var(--text-tertiary)" size={24} />
           <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Global aggregate statistics are locked for Standard Users. Upgrade to Admin to view platform-wide analytics.</p>
        </div>
      )}

      {/* History Charts List */}
      <h2 style={{ marginBottom: '1rem' }}>{auth.role === 'admin' ? 'Platform Activity' : 'Your Activity'}</h2>
      <div className="grid-2" style={{ marginBottom: '2rem' }}>
        <div className="glass-panel" style={{ height: '350px' }}>
          <h2>Score History Trend</h2>
          <ResponsiveContainer width="100%" height="85%">
            <AreaChart data={history} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="scoreGlow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" stroke="#6b7280" style={{ fontSize: '0.75rem' }} />
              <YAxis stroke="#6b7280" style={{ fontSize: '0.75rem' }} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'rgba(19, 20, 28, 0.9)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }} 
              />
              <Area type="monotone" dataKey="score" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#scoreGlow)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {auth.role === 'admin' && (
          <div className="glass-panel" style={{ height: '350px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <h2 style={{ alignSelf: 'flex-start' }}>Global Traffic Distribution</h2>
            <ResponsiveContainer width="100%" height="85%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="rgba(0,0,0,0)"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: 'rgba(19, 20, 28, 0.9)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '-1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><div style={{ width: 12, height: 12, borderRadius: '50%', background: '#10b981' }}/> <span style={{fontSize: '0.875rem', color: '#9ca3af'}}>Normal</span></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ef4444' }}/> <span style={{fontSize: '0.875rem', color: '#9ca3af'}}>Anomaly</span></div>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};

export default Dashboard;
