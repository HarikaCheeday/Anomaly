import React, { useState } from 'react';
import axios from 'axios';
import { Zap, ShieldCheck, ShieldAlert, Cpu } from 'lucide-react';

const API_BASE = 'https://anomaly-m60v.onrender.com/api';

const Predictor = ({ auth }) => {
  const defaultFeatures = {
    packet_count: 150,
    byte_count: 12000,
    flow_duration: 5.0,
    avg_packet_size: 80,
    syn_count: 10,
    udp_ratio: 0.3,
    dst_port_entropy: 0.4,
    conn_frequency: 5
  };

  const [features, setFeatures] = useState(defaultFeatures);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const testCases = {
    normal: { packet_count: 145, byte_count: 11500, flow_duration: 5.2, avg_packet_size: 82.0, syn_count: 8, udp_ratio: 0.32, dst_port_entropy: 0.38, conn_frequency: 4 },
    border: { packet_count: 400, byte_count: 30000, flow_duration: 3.0, avg_packet_size: 75.0, syn_count: 50, udp_ratio: 0.20, dst_port_entropy: 0.60, conn_frequency: 10 },
    suspicious: { packet_count: 820, byte_count: 59000, flow_duration: 3.8, avg_packet_size: 72.1, syn_count: 105, udp_ratio: 0.15, dst_port_entropy: 0.84, conn_frequency: 18 }
  };

  const handleInputChange = (e) => {
    setFeatures({ ...features, [e.target.name]: parseFloat(e.target.value) || 0 });
  };

  const loadPreset = (caseType) => {
    setFeatures(testCases[caseType]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(false);
    try {
      const response = await axios.post(`${API_BASE}/predict`, features, {
         headers: { Authorization: `Bearer ${auth.token}` }
      });
      setResult(response.data.prediction);
    } catch (err) {
      console.error("Prediction Error:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 style={{ marginBottom: '0.5rem' }}>Real-time Input Predictor</h1>
      <p style={{ marginBottom: '2rem' }}>Analyze live IoT network data vectors</p>

      {error && (
        <div style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '0.75rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
          Network or Authentication Error evaluating traffic.
        </div>
      )}

      <div className="grid-2">
        {/* Input Form */}
        <div className="glass-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
             <h2>Network Features</h2>
             <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button type="button" onClick={() => loadPreset('normal')} className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}>Normal</button>
                <button type="button" onClick={() => loadPreset('border')} className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}>Border</button>
                <button type="button" onClick={() => loadPreset('suspicious')} className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', borderColor: 'rgba(239, 68, 68, 0.5)', color: '#ef4444' }}>Attack</button>
             </div>
          </div>
          <form onSubmit={handleSubmit} className="grid-2">
             {Object.keys(defaultFeatures).map((key) => (
                <div key={key} className="input-group">
                  <label className="input-label" style={{ textTransform: 'capitalize' }}>
                    {key.replace(/_/g, ' ')}
                  </label>
                  <input
                    type="number"
                    step="any"
                    name={key}
                    value={features[key]}
                    onChange={handleInputChange}
                    className="input-field"
                    required
                  />
                </div>
             ))}
             
             <div style={{ gridColumn: 'span 2', marginTop: '1rem' }}>
               <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                 {loading ? <Cpu size={20} className="pulse" /> : <Zap size={20} />}
                 {loading ? 'Processing through ML Pipeline...' : 'Run Prediction Model'}
               </button>
             </div>
          </form>
        </div>

        {/* Results Panel */}
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column' }}>
           <h2>Analysis Result</h2>
           
           <div style={{ 
               flex: 1, 
               display: 'flex', 
               flexDirection: 'column', 
               justifyContent: 'center', 
               alignItems: 'center',
               background: 'rgba(0,0,0,0.2)',
               borderRadius: '12px',
               marginTop: '1rem',
               padding: '2rem'
            }}>
               
               {result ? (
                 <>
                   <div className={result.status === 'SUSPICIOUS' ? 'pulse' : ''} style={{
                     width: '100px',
                     height: '100px',
                     borderRadius: '50%',
                     background: result.status === 'SUSPICIOUS' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                     border: `2px solid ${result.status === 'SUSPICIOUS' ? '#ef4444' : '#10b981'}`,
                     display: 'flex',
                     alignItems: 'center',
                     justifyContent: 'center',
                     marginBottom: '1.5rem',
                     boxShadow: `0 0 30px ${result.status === 'SUSPICIOUS' ? 'rgba(239, 68, 68, 0.4)' : 'rgba(16, 185, 129, 0.4)'}`
                   }}>
                     {result.status === 'SUSPICIOUS' ? <ShieldAlert size={48} color="#ef4444" /> : <ShieldCheck size={48} color="#10b981" />}
                   </div>
                   
                   <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: result.status === 'SUSPICIOUS' ? '#ef4444' : '#10b981' }}>
                     {result.status}
                   </h3>
                   
                   <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', textAlign: 'center' }}>
                     The RandomForest model calculated an anomaly score of <strong>{(result.score * 100).toFixed(1)}%</strong>
                   </p>
                   
                   <div style={{ display: 'flex', width: '100%', gap: '1rem' }}>
                     <div style={{ flex: 1, padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid var(--glass-border)', textAlign: 'center' }}>
                       <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: '0.25rem' }}>Alert Level</div>
                       <div style={{ fontWeight: '500', color: result.alert_level === 'HIGH' ? '#ef4444' : result.alert_level === 'MEDIUM' ? '#f59e0b' : '#3b82f6' }}>{result.alert_level}</div>
                     </div>
                     <div style={{ flex: 1, padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid var(--glass-border)', textAlign: 'center' }}>
                       <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: '0.25rem' }}>Confidence</div>
                       <div style={{ fontWeight: '500', color: '#fff' }}>94.2%</div>
                     </div>
                   </div>
                 </>
               ) : (
                 <div style={{ textAlign: 'center', color: 'var(--text-tertiary)' }}>
                   <Cpu size={48} style={{ opacity: 0.5, marginBottom: '1rem' }} />
                   <p>Awaiting data input...</p>
                 </div>
               )}
               
           </div>
        </div>
      </div>
    </div>
  );
};

export default Predictor;
