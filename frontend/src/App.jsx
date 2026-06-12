import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Contacts from './pages/Contacts';
import MapView from './pages/MapView';
import Layout from './components/Common/Layout';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{background:'#070d1a'}}>
        <div className="text-center">
          <div className="w-10 h-10 rounded-full border-2 mx-auto mb-4" style={{borderColor:'#1e2d4a', borderTopColor:'#3b82f6', animation:'spin 1s linear infinite'}}></div>
          <p className="text-xs font-bold uppercase tracking-widest" style={{color:'#3b82f6'}}>Initializing Secure Connection...</p>
        </div>
      </div>
    );
  }
  return user ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<PrivateRoute><Layout><Dashboard /></Layout></PrivateRoute>} />
          <Route path="/contacts" element={<PrivateRoute><Layout><Contacts /></Layout></PrivateRoute>} />
          <Route path="/map" element={<PrivateRoute><Layout><MapView /></Layout></PrivateRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
