import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlert, Users, Map, LogOut, User, Radio } from 'lucide-react';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'SOS Alert', icon: ShieldAlert },
    { path: '/contacts', label: 'Contacts', icon: Users },
    { path: '/map', label: 'Safety Map', icon: Map },
  ];

  return (
    <div className="min-h-screen flex flex-col pb-16 md:pb-0" style={{background:'#070d1a'}}>
      {/* Top Header */}
      <header className="sticky top-0 z-40 border-b px-6 py-3 flex items-center justify-between" 
        style={{background:'#0a1020', borderColor:'#1e2d4a', boxShadow:'0 2px 20px rgba(0,0,0,0.5)'}}>
        
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg" style={{background:'rgba(239,68,68,0.15)', border:'1px solid rgba(239,68,68,0.3)'}}>
            <ShieldAlert className="w-5 h-5" style={{color:'#f87171'}} />
          </div>
          <div>
            <span className="text-base font-black tracking-widest block leading-tight" style={{color:'#e2e8f0'}}>AEGIS</span>
            <span className="text-[9px] font-bold uppercase tracking-widest block" style={{color:'#3b82f6'}}>Safety Network</span>
          </div>
        </div>

        {/* Live indicator */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full" style={{background:'rgba(16,185,129,0.08)', border:'1px solid rgba(16,185,129,0.2)'}}>
          <span className="w-2 h-2 rounded-full pulse-dot" style={{background:'#10b981'}}></span>
          <span className="text-[10px] font-bold uppercase tracking-wider" style={{color:'#34d399'}}>System Online</span>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path}
                className="flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-xs transition-all uppercase tracking-wider"
                style={isActive 
                  ? {background:'rgba(239,68,68,0.15)', color:'#f87171', border:'1px solid rgba(239,68,68,0.3)'} 
                  : {color:'#64748b', border:'1px solid transparent'}}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User & Logout */}
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-2 py-1.5 px-3 rounded-full" style={{background:'#0d1729', border:'1px solid #1e2d4a'}}>
            <User className="w-3.5 h-3.5" style={{color:'#3b82f6'}} />
            <span className="text-xs font-semibold" style={{color:'#94a3b8'}}>{user?.name}</span>
          </div>
          <button onClick={logout}
            className="p-2 rounded-lg transition-all cursor-pointer"
            style={{background:'#0d1729', border:'1px solid #1e2d4a', color:'#64748b'}}
            title="Log Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Scanline effect */}
      <div className="scanline" style={{zIndex:1, pointerEvents:'none'}}></div>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-6 relative z-10">
        {children}
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 flex justify-around py-2 px-2"
        style={{background:'#0a1020', borderTop:'1px solid #1e2d4a', boxShadow:'0 -4px 20px rgba(0,0,0,0.5)'}}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link key={item.path} to={item.path}
              className="flex flex-col items-center gap-1 py-1.5 px-5 rounded-xl transition-all"
              style={isActive ? {color:'#f87171', background:'rgba(239,68,68,0.1)'} : {color:'#475569'}}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[9px] font-bold tracking-tight">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default Layout;
