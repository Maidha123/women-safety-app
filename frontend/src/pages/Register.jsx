import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, User, Mail, Phone, Lock, AlertCircle } from 'lucide-react';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      const res = await register(name, email, password, phone);
      if (res.success) navigate('/');
      else setError(res.message);
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const fields = [
    { label: 'Full Name', id: 'name', type: 'text', value: name, setter: setName, icon: User, placeholder: 'Jane Doe' },
    { label: 'Email Address', id: 'email', type: 'email', value: email, setter: setEmail, icon: Mail, placeholder: 'name@example.com' },
    { label: 'Mobile Phone', id: 'phone', type: 'tel', value: phone, setter: setPhone, icon: Phone, placeholder: '+92 300 0000000' },
    { label: 'Password', id: 'password', type: 'password', value: password, setter: setPassword, icon: Lock, placeholder: 'At least 6 characters', minLength: 6 },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden grid-overlay"
      style={{background:'#070d1a'}}>
      
      <div className="absolute top-0 left-0 right-0 h-0.5" style={{background:'linear-gradient(to right, transparent, #3b82f6, transparent)'}} />
      <div className="absolute -top-60 -right-60 w-[500px] h-[500px] rounded-full pointer-events-none" style={{background:'radial-gradient(circle, rgba(59,130,246,0.07) 0%, transparent 70%)'}} />

      <div className="w-full max-w-md rounded-2xl p-8 relative z-10" style={{background:'#0d1729', border:'1px solid #1e2d4a', boxShadow:'0 24px 60px rgba(0,0,0,0.6)'}}>
        
        <div className="text-center mb-7">
          <div className="inline-flex p-4 rounded-2xl mb-4" style={{background:'rgba(59,130,246,0.1)', border:'1px solid rgba(59,130,246,0.2)'}}>
            <ShieldAlert className="w-9 h-9" style={{color:'#60a5fa'}} />
          </div>
          <h1 className="text-3xl font-black tracking-tight mb-1" style={{color:'#f1f5f9'}}>JOIN AEGIS</h1>
          <p className="text-xs font-bold uppercase tracking-widest" style={{color:'#3b82f6'}}>Emergency Protection Network</p>
        </div>

        {error && (
          <div className="mb-5 flex items-start gap-3 p-4 rounded-xl text-sm" style={{background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.25)', color:'#f87171'}}>
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {fields.map(({ label, id, type, value, setter, icon: Icon, placeholder, minLength }) => (
            <div key={id}>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{color:'#64748b'}}>{label}</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3" style={{color:'#3b82f6'}}>
                  <Icon className="w-4 h-4" />
                </span>
                <input id={id} type={type} value={value} onChange={(e) => setter(e.target.value)}
                  required minLength={minLength}
                  className="dark-input w-full rounded-xl py-2.5 pl-10 pr-4 text-sm font-medium"
                  placeholder={placeholder} />
              </div>
            </div>
          ))}

          <button type="submit" disabled={isSubmitting}
            className="w-full py-3.5 px-4 font-bold rounded-xl transition-all text-sm uppercase tracking-wider mt-2 cursor-pointer"
            style={{background: isSubmitting ? '#1e3a5f' : 'linear-gradient(135deg, #2563eb, #1d4ed8)', color:'white', boxShadow:'0 4px 20px rgba(59,130,246,0.25)'}}>
            {isSubmitting ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm" style={{color:'#475569'}}>
          Already registered?{' '}
          <Link to="/login" className="font-bold" style={{color:'#f87171'}}>Sign In</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
