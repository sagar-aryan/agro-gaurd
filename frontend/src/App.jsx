import React, { useState, useEffect, useRef } from 'react';
import { Settings, X, Cpu, Send, RefreshCw, Activity, Droplets, Thermometer, Wind, Power } from 'lucide-react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import StartupAnimation from './StartupAnimation';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

export default function App() {
  const [showAnimation, setShowAnimation] = useState(true);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  
  // Dashboard Overlays
  const [isFire, setIsFire] = useState(false);
  const [isIntruder, setIsIntruder] = useState(false);

  // Data State
  const [sensors, setSensors] = useState({ ph: "0", temperature: "0", humidity: "0", moisture: "0" });
  
  // Pump Relay State
  const [relayState, setRelayState] = useState(0);

  // Chart Modal
  const [chartModal, setChartModal] = useState({ isOpen: false, feedName: null, data: [] });
  const [isChartLoading, setIsChartLoading] = useState(false);

  // Chat State
  const [chatHistory, setChatHistory] = useState([]);
  const [prompt, setPrompt] = useState("");
  const [isChatSubmitting, setIsChatSubmitting] = useState(false);

  // Camera Servos State
  const [pan, setPan] = useState(90);
  const [tilt, setTilt] = useState(90);

  const reconnectTimeout = useRef(null);

  // --- WebSocket Connection ---
  useEffect(() => {
    if (showAnimation) return;
    
    let ws;

    const connectWS = () => {
      const wsUrl = `ws://${window.location.hostname}:8000/ws/alerts`;
      ws = new WebSocket(wsUrl);
      
      ws.onmessage = (event) => {
        const msg = event.data;
        if (msg === "FIRE_ALERT") setIsFire(true);
        else if (msg === "FIRE_SAFE") setIsFire(false);
        else if (msg === "INTRUDER_ALERT") setIsIntruder(true);
        else if (msg === "INTRUDER_SAFE") setIsIntruder(false);
      };
      
      ws.onclose = () => {
        console.log('WS Disconnected. Attempting reconnect in 3s...');
        reconnectTimeout.current = setTimeout(connectWS, 3000);
      };
    };

    connectWS();
    
    return () => {
      if (ws && (ws.readyState === 1 || ws.readyState === 0)) {
        ws.close();
      }
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current);
      }
    };
  }, [showAnimation]);

  // --- Theme ---
  useEffect(() => {
    localStorage.setItem('theme', theme);
    document.body.className = theme;
  }, [theme]);

  // --- Live Sensor Polling ---
  useEffect(() => {
    if (showAnimation) return;

    const fetchLiveSensors = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/sensors/live`);
        if (res.ok) {
          const data = await res.json();
          setSensors(data);
        }
      } catch (e) {
        console.error("Live sensors fetch error", e);
      }
    };

    fetchLiveSensors();
    const intervalId = setInterval(fetchLiveSensors, 5000); // Poll local sqlite quicker

    return () => clearInterval(intervalId);
  }, [showAnimation]);

  // --- Control Handlers ---
  const handleCameraControl = async (axis, value) => {
    try {
      await fetch(`${BACKEND_URL}/api/control/camera`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [axis]: value })
      });
    } catch (e) {
      console.error(`Error setting camera:`, e);
    }
  };

  const handleRelayToggle = async () => {
    const newState = relayState === 0 ? 1 : 0;
    setRelayState(newState);
    try {
      await fetch(`${BACKEND_URL}/api/control/relay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ relay: newState })
      });
    } catch (e) {
      console.error(`Error setting relay state:`, e);
    }
  };

  // --- Action: Send AI Chat ---
  const handleSendChat = async () => {
    if (!prompt.trim()) return;

    const newHistory = [...chatHistory, { role: "user", content: prompt }];
    setChatHistory(newHistory);
    const currentPrompt = prompt;
    setPrompt("");
    setIsChatSubmitting(true);

    try {
      const res = await fetch(`${BACKEND_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: currentPrompt,
          chat_history: chatHistory
        })
      });
      const data = await res.json();
      
      if (!res.ok) {
         setChatHistory(prev => [...prev, { role: "assistant", content: `**Backend Error**: ${data.detail || 'Unknown server error'}` }]);
         return;
      }

      setChatHistory(prev => [...prev, { role: "assistant", content: data.reply || "Error fetching reply" }]);

    } catch (err) {
      console.error(err);
      setChatHistory(prev => [...prev, { role: "assistant", content: `**Network Error**: Unable to reach AI agent. ${err.message}` }]);
    } finally {
      setIsChatSubmitting(false);
    }
  };

  // --- Action: Open Chart Modal ---
  const openChart = async (feedName) => {
    setChartModal({ isOpen: true, feedName, data: [] });
    setIsChartLoading(true);

    try {
      const res = await fetch(`${BACKEND_URL}/api/sensors/history/${feedName}`);
      if (res.ok) {
        const data = await res.json();
        setChartModal({ isOpen: true, feedName, data });
      }
    } catch (err) {
      console.error("Fetch history error", err);
    } finally {
      setIsChartLoading(false);
    }
  };

  if (showAnimation) {
    return <StartupAnimation onComplete={() => setShowAnimation(false)} />;
  }

  const chartData = {
    labels: chartModal.data.map(d => {
      const date = new Date(d.time * 1000);
      return `${date.getHours()}:00`;
    }),
    datasets: [
      {
        label: `${chartModal.feedName} past 24h`,
        data: chartModal.data.map(d => d.value),
        borderColor: '#4ade80',
        backgroundColor: 'rgba(74, 222, 128, 0.2)',
        tension: 0.4,
        fill: true,
      }
    ]
  };

  return (
    <div className={`app-container ${theme}`}>
      {/* MASSIVE CRITICAL FIRE/INTRUSION OVERLAY */}
      {(isFire || isIntruder) && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(255, 0, 0, 0.9)', zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', animation: 'pulse 1s infinite' }}>
              <h1 style={{ color: 'white', fontSize: '5rem', fontWeight: 'bold', margin: 0, textAlign: 'center', textTransform: 'uppercase' }}>
                  {isFire && isIntruder ? "CRITICAL: MULTIPLE ANOMALIES" : (isFire ? "FIRE DETECTED" : "SECURITY INTRUSION")}
              </h1>
              <p style={{ color: 'white', fontSize: '2rem', marginTop: '1rem', textAlign: 'center'}}>
                 {isFire && isIntruder ? "Sensors detect thermal event and physical bounding box intrusion." : (isFire ? "Thermal anomaly detected on crop sensors!" : "Unidentified object detected in perimeter!")}
              </p>
              <div style={{ marginTop: '3rem', fontSize: '1.5rem', color: 'white', fontWeight: 'bold', padding: '1rem 3rem', border: '3px solid white', borderRadius: '8px' }}>
                  WAITING FOR EDGE RESOLUTION...
              </div>
          </div>
      )}

      {/* Header */}
      <header className="app-header">
        <div className="logo-container">
          <span className="logo-text">GREEN TECH</span>
        </div>
        <button className="icon-btn" onClick={() => setIsSettingsOpen(true)}>
          <Settings size={22} className="text-gray" />
        </button>
      </header>

      <main className="main-content">
        {/* Settings Modal */}
        {isSettingsOpen && (
          <div className="modal-overlay">
            <div className="modal-content glass panel">
              <div className="modal-header">
                <h2>Settings</h2>
                <button className="icon-btn" onClick={() => setIsSettingsOpen(false)}><X /></button>
              </div>
              <div className="modal-body">
                <div className="setting-row">
                  <span>Theme</span>
                  <button 
                    className="toggle-theme-btn"
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  >
                    Switch to {theme === 'dark' ? 'Light' : 'Dark'} Mode
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Center MJPEG Image Stream & Camera Controls */}
        <section className="video-section">
          <div className="camera-control-layout" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%', maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'stretch', minHeight: '300px' }}>
              <div className="video-container glass" style={{ flexGrow: 1, position: 'relative' }}>
                <img 
                  src={`${BACKEND_URL}/api/video_feed`} 
                  alt="YOLO Object Detection Stream" 
                  className="crop-video" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit' }}
                />
                <div className="video-overlay-status">
                  <div className="status-dot pulse"></div>
                  <span>EDGE CV AI</span>
                </div>
              </div>
              
              <div className="vertical-slider-container glass" style={{ padding: '20px 15px', display: 'flex', alignItems: 'center', height: 'auto' }}>
                <Slider 
                  vertical 
                  min={0} 
                  max={180} 
                  defaultValue={90}
                  value={tilt} 
                  onChange={(val) => setTilt(val)}
                  onAfterChange={(val) => handleCameraControl('vertical', val)}
                  trackStyle={{ backgroundColor: '#22c55e' }}
                  handleStyle={{ borderColor: '#22c55e', backgroundColor: '#fff' }}
                />
              </div>
            </div>
            
            <div className="horizontal-slider-container glass" style={{ padding: '15px 20px' }}>
              <Slider 
                min={0} 
                max={180} 
                defaultValue={90}
                value={pan} 
                onChange={(val) => setPan(val)}
                onAfterChange={(val) => handleCameraControl('horizontal', val)}
                trackStyle={{ backgroundColor: '#22c55e' }}
                handleStyle={{ borderColor: '#22c55e', backgroundColor: '#fff' }}
              />
            </div>
          </div>
          
          <button className="ai-agent-btn glowing-btn" style={{ marginTop: '1.5rem' }} onClick={() => setIsChatOpen(true)}>
            <Cpu size={18} /> ASK AI AGENT
          </button>
        </section>

        {/* AI Chat Modal */}
        {isChatOpen && (
          <div className="chat-interface glass sliding-panel">
            <div className="modal-header">
              <h3>AI Farm Advisor</h3>
              <button className="icon-btn" onClick={() => setIsChatOpen(false)}><X /></button>
            </div>
            
            <div className="chat-messages">
              {chatHistory.length === 0 && (
                <div className="chat-empty">
                  Ask me anything about your current edge infrastructure and crop health.
                </div>
              )}
              {chatHistory.map((msg, i) => (
                <div key={i} className={`chat-bubble ${msg.role}`}>
                  <div className="chat-bubble-content">
                   <div dangerouslySetInnerHTML={{ __html: msg.content.replace(/\n/g, '<br />') }} />
                  </div>
                </div>
              ))}
              {isChatSubmitting && (
                <div className="chat-bubble assistant typing">
                  <span className="dot"></span><span className="dot"></span><span className="dot"></span>
                </div>
              )}
            </div>

            <div className="chat-input-area">
              <input 
                value={prompt} 
                onChange={e => setPrompt(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
                placeholder="Diagnose current crop..."
                autoFocus
              />
              <button onClick={handleSendChat} disabled={isChatSubmitting || !prompt.trim()}>
                <Send size={18} />
              </button>
            </div>
          </div>
        )}

        {/* Tiles Grid */}
        <section className="sensor-grid">
          {[
            { label: 'PH', key: 'ph', icon: <Droplets size={20} />, color: '#fbbf24' },
            { label: 'Temperature', key: 'temperature', icon: <Thermometer size={20} />, color: '#ef4444' },
            { label: 'Humidity', key: 'humidity', icon: <Wind size={20} />, color: '#3b82f6' },
            { label: 'Moisture', key: 'moisture', icon: <Activity size={20} />, color: '#22c55e' }
          ].map((sensor) => (
            <div 
              key={sensor.key} 
              className="sensor-tile glass grow-hover"
              onClick={() => openChart(sensor.key)}
            >
              <div className="tile-header" style={{ color: sensor.color }}>
                {sensor.icon} <span>{sensor.label}</span>
              </div>
              <div className="tile-value">
                {sensors[sensor.key] !== "N/A" ? sensors[sensor.key] : "--"}
              </div>
            </div>
          ))}
          
          <div className="sensor-tile glass grow-hover" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
               <div className="tile-header" style={{ color: '#ec4899', width: '100%', marginBottom: '0.5rem' }}>
                  <Power size={20} /> <span>Water Pump</span>
               </div>
               <button 
                  onClick={handleRelayToggle}
                  style={{
                      padding: '10px 20px', 
                      borderRadius: '30px', 
                      border: 'none', 
                      backgroundColor: relayState === 1 ? '#22c55e' : '#374151',
                      color: 'white',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      transition: 'background-color 0.3s'
                  }}>
                  {relayState === 1 ? 'PUMP RUNNING' : 'PUMP OFF'}
               </button>
          </div>

        </section>

        {/* Chart Modal */}
        {chartModal.isOpen && (
          <div className="modal-overlay">
            <div className="modal-content chart-modal glass panel">
              <div className="modal-header">
                <h2>{chartModal.feedName.toUpperCase()} - 24H History</h2>
                <button className="icon-btn" onClick={() => setChartModal({ isOpen: false, feedName: null, data: [] })}><X /></button>
              </div>
              <div className="modal-body h-64">
                {isChartLoading ? (
                  <div className="flex-center loading-spinner">
                    <RefreshCw className="spin" size={32} />
                  </div>
                ) : (
                  <div className="chart-wrapper">
                    <Line 
                      data={chartData} 
                      options={{ maintainAspectRatio: false }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      </main>
      <footer className="app-footer">
        <p>Green tech industries ltd</p>
      </footer>
    </div>
  );
}
