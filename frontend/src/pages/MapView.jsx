import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MapPin, AlertOctagon, Compass, TrendingUp, ShieldAlert, Radio } from 'lucide-react';

const MapView = () => {
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedZone, setSelectedZone] = useState(null);
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  const fetchDangerZones = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/incidents/danger-zones');
      setZones(res.data.data);
      if (res.data.data.length > 0) setSelectedZone(res.data.data[0]);
    } catch (err) {
      console.error('Error fetching danger zones:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDangerZones(); }, []);

  const riskColor = zones.length < 3 ? '#10b981' : zones.length < 7 ? '#f59e0b' : '#ef4444';
  const riskLabel = zones.length < 3 ? 'LOW' : zones.length < 7 ? 'MODERATE' : 'HIGH';

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight" style={{color:'#f1f5f9'}}>DANGER ZONES MAP</h1>
          <p className="text-sm mt-1" style={{color:'#475569'}}>Coordinates where SOS alerts were triggered.</p>
        </div>
        <div className="py-1.5 px-3.5 rounded-full text-xs font-bold" style={{background:'rgba(59,130,246,0.1)', border:'1px solid rgba(59,130,246,0.2)', color:'#60a5fa'}}>
          {apiKey ? '🟢 Maps Online' : '🔵 Simulation Mode'}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left Panel */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          {/* Stats */}
          <div className="emergency-card rounded-2xl p-5">
            <h3 className="text-xs font-bold uppercase tracking-wider mb-4 flex items-center gap-2" style={{color:'#475569'}}>
              <TrendingUp className="w-4 h-4" style={{color:'#3b82f6'}} /> Safety Index
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl p-4" style={{background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.15)'}}>
                <span className="block text-[9px] font-black uppercase mb-1" style={{color:'#64748b'}}>Alert Zones</span>
                <span className="text-3xl font-black" style={{color:'#f87171'}}>{zones.length}</span>
              </div>
              <div className="rounded-xl p-4" style={{background:`rgba(${riskLabel==='LOW'?'16,185,129':riskLabel==='MODERATE'?'245,158,11':'239,68,68'},0.08)`, border:`1px solid rgba(${riskLabel==='LOW'?'16,185,129':riskLabel==='MODERATE'?'245,158,11':'239,68,68'},0.2)`}}>
                <span className="block text-[9px] font-black uppercase mb-1" style={{color:'#64748b'}}>Risk Level</span>
                <span className="text-lg font-black" style={{color: riskColor}}>{riskLabel}</span>
              </div>
            </div>
          </div>

          {/* Coordinates List */}
          <div className="emergency-card rounded-2xl p-5 flex-1 flex flex-col" style={{minHeight:'300px'}}>
            <h3 className="text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2" style={{color:'#475569'}}>
              <AlertOctagon className="w-4 h-4" style={{color:'#f87171'}} /> Alert Coordinates
            </h3>
            {loading ? (
              <div className="flex-grow flex items-center justify-center text-xs" style={{color:'#475569'}}>Fetching data...</div>
            ) : zones.length === 0 ? (
              <div className="flex-grow flex items-center justify-center text-xs text-center" style={{color:'#475569'}}>No incidents recorded.</div>
            ) : (
              <div className="flex-grow overflow-y-auto space-y-2 max-h-[280px] pr-1">
                {zones.map((zone) => (
                  <button key={zone.id} onClick={() => setSelectedZone(zone)}
                    className="w-full text-left p-3 rounded-xl text-xs transition-all flex flex-col gap-1.5 cursor-pointer"
                    style={selectedZone?.id === zone.id
                      ? {background:'rgba(239,68,68,0.12)', border:'1px solid rgba(239,68,68,0.35)'}
                      : {background:'rgba(255,255,255,0.02)', border:'1px solid #1e2d4a'}}>
                    <div className="flex items-center justify-between">
                      <span className="font-bold" style={{color:'#e2e8f0'}}>SOS Incident</span>
                      <span className="text-[10px]" style={{color:'#475569'}}>{new Date(zone.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5" style={{color:'#f87171'}} />
                      <span className="font-mono text-[11px]" style={{color:'#64748b'}}>
                        {zone.latitude.toFixed(4)}, {zone.longitude.toFixed(4)}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Map Canvas */}
        <div className="lg:col-span-8 emergency-card rounded-2xl overflow-hidden flex flex-col" style={{minHeight:'450px'}}>
          <div className="flex-1 relative flex items-center justify-center grid-overlay" style={{minHeight:'400px'}}>
            {/* Radar rings */}
            <div className="absolute w-48 h-48 rounded-full" style={{border:'1px solid rgba(59,130,246,0.1)', animation:'radar 4s infinite linear'}}></div>
            <div className="absolute w-72 h-72 rounded-full" style={{border:'1px solid rgba(59,130,246,0.07)', animation:'radar 4s infinite linear', animationDelay:'1s'}}></div>
            <div className="absolute w-96 h-96 rounded-full" style={{border:'1px solid rgba(59,130,246,0.04)', animation:'radar 4s infinite linear', animationDelay:'2s'}}></div>

            <div className="z-10 rounded-2xl p-7 max-w-sm w-full mx-4" style={{background:'rgba(13,23,41,0.95)', border:'1px solid #1e2d4a', boxShadow:'0 20px 50px rgba(0,0,0,0.5)'}}>
              <Compass className="w-10 h-10 mx-auto mb-4" style={{color:'#3b82f6', animation:'spin 8s linear infinite'}} />
              <h3 className="font-black text-center text-base mb-2" style={{color:'#f1f5f9'}}>Safety Radar Grid</h3>
              <p className="text-xs text-center leading-relaxed mb-5" style={{color:'#475569'}}>
                Visualizing historical alert markers and threat corridors.
              </p>

              {selectedZone ? (
                <div className="p-4 rounded-xl" style={{background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)'}}>
                  <div className="flex items-center gap-2 mb-3">
                    <ShieldAlert className="w-4 h-4" style={{color:'#f87171'}} />
                    <span className="text-xs font-bold uppercase tracking-wider" style={{color:'#f87171'}}>Active Threat Pin</span>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span style={{color:'#64748b'}}>Latitude</span>
                      <span className="font-mono font-bold" style={{color:'#e2e8f0'}}>{selectedZone.latitude.toFixed(6)}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span style={{color:'#64748b'}}>Longitude</span>
                      <span className="font-mono font-bold" style={{color:'#e2e8f0'}}>{selectedZone.longitude.toFixed(6)}</span>
                    </div>
                    <div className="flex justify-between text-xs pt-1" style={{borderTop:'1px solid rgba(239,68,68,0.15)'}}>
                      <span style={{color:'#64748b'}}>Address</span>
                      <span className="font-medium text-right max-w-[60%]" style={{color:'#94a3b8'}}>{selectedZone.address}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl text-center text-xs" style={{background:'rgba(59,130,246,0.05)', border:'1px solid rgba(59,130,246,0.1)', color:'#475569'}}>
                  Select a coordinate from the list to inspect.
                </div>
              )}

              {!apiKey && (
                <p className="text-[9px] mt-4 text-center" style={{color:'#334155'}}>
                  Add VITE_GOOGLE_MAPS_API_KEY to enable live map rendering.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapView;
