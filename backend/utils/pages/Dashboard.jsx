import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { MapPin, Users, History, Mic, Video, CheckCircle, FileAudio, Activity, Shield } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [isEmergencyActive, setIsEmergencyActive] = useState(false);
  const [currentIncident, setCurrentIncident] = useState(null);
  const [incidents, setIncidents] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [sosStatusMessage, setSosStatusMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingType, setRecordingType] = useState(null);
  const mediaRecorderRef = useRef(null);
  const recordingChunksRef = useRef([]);

  const fetchIncidentHistory = async () => {
    setLoadingHistory(true);
    try {
      const res = await axios.get('/api/incidents/history');
      setIncidents(res.data.data);
    } catch (err) {
      console.error('Error fetching incident history:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => { fetchIncidentHistory(); }, []);

  const getLocationByIP = async () => {
    const res = await fetch('http://ip-api.com/json/');
    const data = await res.json();
    if (data.lat && data.lon) return { latitude: data.lat, longitude: data.lon };
    throw new Error('IP location failed');
  };

  const startEvidenceRecording = async (type, incidentData) => {
    if (!incidentData || isRecording) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia(
        type === 'video' ? { video: true, audio: true } : { audio: true }
      );
      setIsRecording(true);
      setRecordingType(type);
      recordingChunksRef.current = [];
      const mimeType = type === 'video' ? 'video/webm' : 'audio/webm';
      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) recordingChunksRef.current.push(e.data); };
      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        const blob = new Blob(recordingChunksRef.current, { type: mimeType });
        const formData = new FormData();
        formData.append('evidence', blob, `${type}_evidence.webm`);
        try {
          const res = await axios.post(`/api/incidents/${incidentData._id}/evidence`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
          if (res.data.success) {
            setSosStatusMessage(`${type.toUpperCase()} evidence saved.`);
            setCurrentIncident(res.data.data);
            fetchIncidentHistory();
          }
        } catch (err) {
          setSosStatusMessage('Evidence upload failed.');
        } finally {
          setIsRecording(false);
          setRecordingType(null);
        }
      };
      mediaRecorder.start();
      setSosStatusMessage(`Recording ${type}... (10 seconds)`);
      setTimeout(() => { if (mediaRecorder.state === 'recording') mediaRecorder.stop(); }, 10000);
    } catch (err) {
      alert(`Could not access ${type === 'video' ? 'camera/microphone' : 'microphone'}. Allow permission.`);
      setIsRecording(false); setRecordingType(null);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state === 'recording') mediaRecorderRef.current.stop();
  };

  const dispatchSOS = async (latitude, longitude) => {
    setSosStatusMessage('Coordinates acquired. Dispatching SOS alerts...');
    try {
      const res = await axios.post('/api/incidents/sos', { latitude, longitude, address: 'GPS Verified Emergency Location' });
      if (res.data.success) {
        setIsEmergencyActive(true);
        setCurrentIncident(res.data.data);
        setSosStatusMessage('Alert dispatched. Emergency contacts notified.');
        startEvidenceRecording('audio', res.data.data);
        fetchIncidentHistory();
      }
    } catch (err) {
      alert('Failed to send SOS. Please dial emergency services immediately.');
      setSosStatusMessage('');
    }
  };

  const handleSOSTrigger = () => {
    if (isEmergencyActive) return;
    setSosStatusMessage('Locating GPS coordinates...');
    if (!navigator.geolocation) {
      getLocationByIP().then(({ latitude, longitude }) => dispatchSOS(latitude, longitude))
        .catch(() => { alert('Could not retrieve location.'); setSosStatusMessage(''); });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async ({ coords: { latitude, longitude } }) => await dispatchSOS(latitude, longitude),
      async (error) => {
        setSosStatusMessage('GPS unavailable. Using network location...');
        try {
          const { latitude, longitude } = await getLocationByIP();
          await dispatchSOS(latitude, longitude);
        } catch { alert('Could not retrieve location.'); setSosStatusMessage(''); }
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
    );
  };

  const handleResolveEmergency = async () => {
    if (!currentIncident) return;
    stopRecording();
    try {
      const res = await axios.put(`/api/incidents/${currentIncident._id}/resolve`);
      if (res.data.success) {
        setIsEmergencyActive(false); setCurrentIncident(null);
        setSosStatusMessage(''); fetchIncidentHistory();
      }
    } catch (err) { console.error(err); }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
      {/* SOS Section */}
      <section className="lg:col-span-8 flex flex-col">
        <div className="emergency-card rounded-2xl p-6 md:p-12 flex flex-col items-center justify-center relative overflow-hidden flex-grow grid-overlay" style={{minHeight:'500px'}}>
          {isEmergencyActive && <div className="absolute inset-0 pointer-events-none" style={{background:'rgba(239,68,68,0.04)', animation:'pulse 2s infinite'}} />}
          
          {/* Ambient glow */}
          <div className="absolute inset-0 pointer-events-none" style={{background: isEmergencyActive ? 'radial-gradient(circle at center, rgba(239,68,68,0.06) 0%, transparent 70%)' : 'radial-gradient(circle at center, rgba(59,130,246,0.04) 0%, transparent 70%)'}} />

          <div className="text-center max-w-md mb-8 relative z-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border mb-4"
              style={isEmergencyActive
                ? {background:'rgba(239,68,68,0.15)', color:'#f87171', border:'1px solid rgba(239,68,68,0.3)', animation:'pulse 2s infinite'}
                : {background:'rgba(16,185,129,0.1)', color:'#34d399', border:'1px solid rgba(16,185,129,0.25)'}}>
              <Activity className="w-3.5 h-3.5" />
              {isEmergencyActive ? 'EMERGENCY ACTIVE' : 'SYSTEM ACTIVE'}
            </span>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight" style={{color:'#f1f5f9'}}>EMERGENCY SOS PORTAL</h2>
            <p className="text-sm mt-2" style={{color:'#475569'}}>
              In case of danger, press the button below. Your live location and audio will be dispatched instantly.
            </p>
          </div>

          <div className="relative flex items-center justify-center w-72 h-72 mb-8 z-10">
            {isEmergencyActive ? (
              <>
                <div className="radar-wave w-full h-full" style={{background:'rgba(239,68,68,0.2)', animationDelay:'0s'}} />
                <div className="radar-wave w-full h-full" style={{background:'rgba(239,68,68,0.12)', animationDelay:'0.8s'}} />
                <div className="radar-wave w-full h-full" style={{background:'rgba(239,68,68,0.06)', animationDelay:'1.6s'}} />
                <button onClick={handleResolveEmergency}
                  className="relative w-52 h-52 rounded-full font-black text-xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
                  style={{background:'linear-gradient(135deg,#991b1b,#7f1d1d)', color:'white', border:'6px solid rgba(239,68,68,0.5)', boxShadow:'0 0 50px rgba(239,68,68,0.4), inset 0 0 30px rgba(0,0,0,0.3)'}}>
                  <span className="tracking-widest">ACTIVE SOS</span>
                  <span className="text-[10px] font-bold py-1 px-3.5 rounded-full uppercase" style={{background:'rgba(255,255,255,0.1)', border:'1px solid rgba(255,255,255,0.15)'}}>
                    Tap to Stop
                  </span>
                </button>
              </>
            ) : (
              <button onClick={handleSOSTrigger}
                className="w-52 h-52 rounded-full font-black text-4xl flex items-center justify-center cursor-pointer transition-all active:scale-95 sos-pulse-animation tracking-wider"
                style={{background:'linear-gradient(135deg,#dc2626,#991b1b)', color:'white', border:'6px solid rgba(239,68,68,0.25)', boxShadow:'0 0 40px rgba(239,68,68,0.35), inset 0 0 20px rgba(0,0,0,0.2)'}}>
                SOS
              </button>
            )}
          </div>

          {sosStatusMessage && (
            <div className="z-10 py-2.5 px-5 rounded-full text-xs font-bold flex items-center gap-2 mb-6"
              style={{background:'rgba(13,23,41,0.9)', border:'1px solid #1e2d4a', color:'#60a5fa', boxShadow:'0 4px 20px rgba(0,0,0,0.4)'}}>
              <div className="w-2.5 h-2.5 rounded-full pulse-dot" style={{background:'#3b82f6'}} />
              {sosStatusMessage}
            </div>
          )}

          {isEmergencyActive && (
            <div className="z-10 flex flex-wrap gap-3 justify-center">
              <button
                onClick={() => isRecording ? stopRecording() : startEvidenceRecording('audio', currentIncident)}
                disabled={isRecording && recordingType !== 'audio'}
                className="flex items-center gap-2 py-3 px-5 rounded-xl font-bold text-xs transition-all disabled:opacity-40 cursor-pointer"
                style={isRecording && recordingType === 'audio'
                  ? {background:'rgba(239,68,68,0.15)', border:'1px solid rgba(239,68,68,0.35)', color:'#f87171'}
                  : {background:'rgba(255,255,255,0.04)', border:'1px solid #1e2d4a', color:'#94a3b8'}}>
                <Mic className={`w-4 h-4 ${isRecording && recordingType === 'audio' ? 'animate-bounce' : ''}`} />
                {isRecording && recordingType === 'audio' ? 'STOP RECORDING' : 'RECORD AUDIO'}
              </button>
              <button
                onClick={() => isRecording ? stopRecording() : startEvidenceRecording('video', currentIncident)}
                disabled={isRecording && recordingType !== 'video'}
                className="flex items-center gap-2 py-3 px-5 rounded-xl font-bold text-xs transition-all disabled:opacity-40 cursor-pointer"
                style={isRecording && recordingType === 'video'
                  ? {background:'rgba(239,68,68,0.15)', border:'1px solid rgba(239,68,68,0.35)', color:'#f87171'}
                  : {background:'rgba(255,255,255,0.04)', border:'1px solid #1e2d4a', color:'#94a3b8'}}>
                <Video className={`w-4 h-4 ${isRecording && recordingType === 'video' ? 'animate-bounce' : ''}`} />
                {isRecording && recordingType === 'video' ? 'STOP RECORDING' : 'RECORD VIDEO'}
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Right Panel */}
      <section className="lg:col-span-4 flex flex-col gap-4">
        <div className="emergency-card rounded-2xl p-5 flex flex-col gap-3">
          <h3 className="text-xs font-bold uppercase tracking-wider" style={{color:'#475569'}}>Quick Actions</h3>
          <Link to="/contacts"
            className="flex items-center justify-between p-3 rounded-xl transition-all group"
            style={{background:'rgba(255,255,255,0.02)', border:'1px solid #1e2d4a'}}>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg" style={{background:'rgba(59,130,246,0.1)', border:'1px solid rgba(59,130,246,0.2)'}}>
                <Users className="w-4 h-4" style={{color:'#60a5fa'}} />
              </div>
              <span className="font-bold text-sm" style={{color:'#e2e8f0'}}>Emergency Contacts</span>
            </div>
            <span className="text-[10px] font-black uppercase py-1 px-2.5 rounded-lg" style={{background:'rgba(59,130,246,0.08)', border:'1px solid rgba(59,130,246,0.15)', color:'#60a5fa'}}>Manage</span>
          </Link>
        </div>

        <div className="emergency-card rounded-2xl p-5 flex-1 flex flex-col" style={{minHeight:'300px'}}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm flex items-center gap-2" style={{color:'#e2e8f0'}}>
              <History className="w-4 h-4" style={{color:'#475569'}} /> Recent Alerts
            </h3>
            <button onClick={fetchIncidentHistory} className="text-xs font-bold cursor-pointer" style={{color:'#3b82f6'}}>
              Refresh
            </button>
          </div>

          {loadingHistory ? (
            <div className="flex-grow flex items-center justify-center text-xs" style={{color:'#475569'}}>
              Fetching history...
            </div>
          ) : incidents.length === 0 ? (
            <div className="flex-grow flex flex-col items-center justify-center text-center p-6 rounded-xl" style={{background:'rgba(255,255,255,0.02)', border:'1px solid #1e2d4a'}}>
              <Shield className="w-8 h-8 mb-2" style={{color:'rgba(16,185,129,0.4)'}} />
              <p className="text-xs font-bold" style={{color:'#e2e8f0'}}>Safe Environment Active</p>
              <p className="text-[10px] mt-1" style={{color:'#334155'}}>Logs appear when SOS is triggered.</p>
            </div>
          ) : (
            <div className="flex-grow overflow-y-auto space-y-2.5 max-h-[350px] pr-1">
              {incidents.map((inc) => (
                <div key={inc._id} className="p-3 rounded-xl flex flex-col gap-2 transition-all"
                  style={{background:'rgba(255,255,255,0.02)', border:'1px solid #1e2d4a'}}>
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] py-0.5 px-2 rounded-full font-bold uppercase ${inc.status === 'active' ? 'badge-active' : 'badge-resolved'}`}>
                      {inc.status}
                    </span>
                    <span className="text-[10px] font-medium" style={{color:'#475569'}}>
                      {new Date(inc.createdAt).toLocaleString(undefined, { month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' })}
                    </span>
                  </div>
                  <div className="flex items-start gap-1.5 text-xs">
                    <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{color:'#3b82f6'}} />
                    <span className="font-mono" style={{color:'#64748b'}}>
                      Lat {inc.location.latitude.toFixed(4)}, Lng {inc.location.longitude.toFixed(4)}
                    </span>
                  </div>
                  {inc.evidence?.length > 0 && (
                    <div className="mt-1 pt-1.5 flex flex-wrap gap-1.5" style={{borderTop:'1px solid #1e2d4a'}}>
                      {inc.evidence.map((ev, i) => (
                        <div key={i} className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded"
                          style={{background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.15)', color:'#f87171'}}>
                          <FileAudio className="w-3 h-3" />
                          <span>Evidence #{i+1} ({ev.fileType})</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
