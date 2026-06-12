import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, Mail, Lock, AlertCircle } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      const res = await login(email, password);
      if (res.success) navigate('/');
      else setError(res.message);
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden grid-overlay"
      style={{background:'#070d1a'}}>
      
      {/* Ambient glows */}
      <div className="absolute top-0 left-0 right-0 h-0.5" style={{background:'linear-gradient(to right, transparent, #3b82f6, transparent)'}} />
      <div className="absolute -top-60 -left-60 w-[500px] h-[500px] rounded-full pointer-events-none" style={{background:'radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)'}} />
      <div className="absolute -bottom-60 -right-60 w-[500px] h-[500px] rounded-full pointer-events-none" style={{background:'radial-gradient(circle, rgba(239,68,68,0.06) 0%, transparent 70%)'}} />

      <div className="w-full max-w-md rounded-2xl p-8 relative z-10" style={{background:'#0d1729', border:'1px solid #1e2d4a', boxShadow:'0 24px 60px rgba(0,0,0,0.6)'}}>
        
        <div className="text-center mb-8">
          <div className="inline-flex p-4 rounded-2xl mb-4" style={{background:'rgba(239,68,68,0.12)', border:'1px solid rgba(239,68,68,0.25)'}}>
            <ShieldAlert className="w-9 h-9" style={{color:'#f87171'}} />
          </div>
          <h1 className="text-3xl font-black tracking-tight mb-2" style={{color:'#f1f5f9'}}>AEGIS</h1>
          <p className="text-xs font-bold uppercase tracking-widest" style={{color:'#3b82f6'}}>Emergency Safety Network</p>
          <p className="text-sm mt-2" style={{color:'#475569'}}>Secure authorization portal</p>
        </div>

        {error && (
          <div className="mb-6 flex items-start gap-3 p-4 rounded-xl text-sm" style={{background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.25)', color:'#f87171'}}>
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{color:'#64748b'}}>Email Address</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3" style={{color:'#3b82f6'}}>
                <Mail className="w-4 h-4" />
              </span>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                className="dark-input w-full rounded-xl py-3 pl-10 pr-4 text-sm font-medium"
                placeholder="name@example.com" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{color:'#64748b'}}>Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3" style={{color:'#3b82f6'}}>
                <Lock className="w-4 h-4" />
              </span>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
                className="dark-input w-full rounded-xl py-3 pl-10 pr-4 text-sm font-medium"
                placeholder="••••••••" />
            </div>
          </div>

          <button type="submit" disabled={isSubmitting}
            className="w-full py-3.5 px-4 font-bold rounded-xl transition-all text-sm uppercase tracking-wider mt-2 cursor-pointer"
            style={{background: isSubmitting ? '#7f1d1d' : 'linear-gradient(135deg, #dc2626, #991b1b)', color:'white', boxShadow:'0 4px 20px rgba(239,68,68,0.3)'}}>
            {isSubmitting ? 'Authenticating...' : 'Enter System'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm" style={{color:'#475569'}}>
          Need an account?{' '}
          <Link to="/register" className="font-bold" style={{color:'#3b82f6'}}>Register Here</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
