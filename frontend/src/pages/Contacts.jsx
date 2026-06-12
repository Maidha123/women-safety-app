import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Trash2, Edit3, User, Phone, Mail, Heart, X, Check, AlertCircle } from 'lucide-react';

const Contacts = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [relationship, setRelationship] = useState('Friend');

  const fetchContacts = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/contacts');
      setContacts(res.data.data);
    } catch (err) {
      setError('Could not fetch contacts list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchContacts(); }, []);

  const resetForm = () => {
    setName(''); setPhone(''); setEmail(''); setRelationship('Friend');
    setEditingId(null); setIsFormOpen(false);
  };

  const handleEditClick = (contact) => {
    setEditingId(contact._id); setName(contact.name); setPhone(contact.phone);
    setEmail(contact.email || ''); setRelationship(contact.relationship || 'Friend');
    setIsFormOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setError('');
    try {
      if (editingId) await axios.put(`/api/contacts/${editingId}`, { name, phone, email, relationship });
      else await axios.post('/api/contacts', { name, phone, email, relationship });
      fetchContacts(); resetForm();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save contact.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this emergency contact?')) return;
    try {
      await axios.delete(`/api/contacts/${id}`);
      fetchContacts();
    } catch { setError('Failed to delete contact.'); }
  };

  return (
    <div className="flex flex-col gap-6 relative">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight" style={{color:'#f1f5f9'}}>EMERGENCY CONTACTS</h1>
          <p className="text-sm mt-1" style={{color:'#475569'}}>Trusted contacts who receive SOS alerts and location data.</p>
        </div>
        <button onClick={() => { resetForm(); setIsFormOpen(true); }}
          className="flex items-center gap-2 py-2.5 px-5 rounded-xl font-bold text-sm transition-all cursor-pointer"
          style={{background:'linear-gradient(135deg,#dc2626,#991b1b)', color:'white', boxShadow:'0 4px 16px rgba(239,68,68,0.3)'}}>
          <Plus className="w-4 h-4" /> Add Contact
        </button>
      </div>

      {error && (
        <div className="flex items-start gap-3 p-4 rounded-xl text-sm" style={{background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.25)', color:'#f87171'}}>
          <AlertCircle className="w-5 h-5 shrink-0" /><span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-sm font-medium" style={{color:'#475569'}}>Retrieving emergency list...</div>
      ) : contacts.length === 0 ? (
        <div className="text-center py-16 rounded-2xl max-w-xl mx-auto w-full" style={{background:'#0d1729', border:'1px solid #1e2d4a'}}>
          <Heart className="w-12 h-12 mx-auto mb-3" style={{color:'rgba(239,68,68,0.3)'}} />
          <p className="font-bold text-base" style={{color:'#e2e8f0'}}>No contacts registered yet</p>
          <p className="text-xs mt-1.5 max-w-xs mx-auto px-4" style={{color:'#475569'}}>
            Add at least one trusted person to receive real-time SOS alerts.
          </p>
          <button onClick={() => setIsFormOpen(true)}
            className="mt-5 inline-flex items-center gap-2 py-2 px-4 rounded-lg font-bold text-xs transition-all cursor-pointer"
            style={{background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.25)', color:'#f87171'}}>
            <Plus className="w-4 h-4" /> Add One Now
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {contacts.map((contact) => (
            <div key={contact._id} className="emergency-card rounded-2xl p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full flex items-center justify-center" style={{background:'rgba(59,130,246,0.1)', border:'1px solid rgba(59,130,246,0.2)'}}>
                      <User className="w-5 h-5" style={{color:'#60a5fa'}} />
                    </div>
                    <div>
                      <h4 className="font-bold text-base leading-tight" style={{color:'#e2e8f0'}}>{contact.name}</h4>
                      <span className="inline-block text-[9px] uppercase font-black tracking-wider px-2 py-0.5 rounded mt-1"
                        style={{background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.2)', color:'#f87171'}}>
                        {contact.relationship}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-xs mt-4 pl-1">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5" style={{color:'#3b82f6'}} />
                    <span className="font-medium" style={{color:'#94a3b8'}}>{contact.phone}</span>
                  </div>
                  {contact.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5" style={{color:'#3b82f6'}} />
                      <span className="font-medium" style={{color:'#94a3b8'}}>{contact.email}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-5 pt-3 flex items-center justify-end gap-2" style={{borderTop:'1px solid #1e2d4a'}}>
                <button onClick={() => handleEditClick(contact)}
                  className="p-2 rounded-lg transition-all cursor-pointer"
                  style={{background:'rgba(59,130,246,0.08)', border:'1px solid rgba(59,130,246,0.15)', color:'#60a5fa'}}>
                  <Edit3 className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(contact._id)}
                  className="p-2 rounded-lg transition-all cursor-pointer"
                  style={{background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.15)', color:'#f87171'}}>
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{background:'rgba(0,0,0,0.8)', backdropFilter:'blur(8px)'}}>
          <div className="w-full max-w-md rounded-2xl p-6 relative" style={{background:'#0d1729', border:'1px solid #1e2d4a', boxShadow:'0 24px 60px rgba(0,0,0,0.8)'}}>
            <button onClick={resetForm} className="absolute top-4 right-4 cursor-pointer" style={{color:'#475569'}}>
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-black mb-5" style={{color:'#f1f5f9'}}>
              {editingId ? 'Edit Emergency Contact' : 'New Emergency Contact'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              {[
                { label: 'Name', type: 'text', value: name, setter: setName, placeholder: 'Jane Doe', required: true },
                { label: 'Phone Number', type: 'tel', value: phone, setter: setPhone, placeholder: '+92 300 0000000', required: true },
                { label: 'Email Address', type: 'email', value: email, setter: setEmail, placeholder: 'jane@example.com', required: false },
              ].map(({ label, type, value, setter, placeholder, required }) => (
                <div key={label}>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{color:'#64748b'}}>{label}</label>
                  <input type={type} value={value} onChange={(e) => setter(e.target.value)} required={required}
                    className="dark-input w-full rounded-xl p-2.5 text-sm font-medium"
                    placeholder={placeholder} />
                </div>
              ))}

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{color:'#64748b'}}>Relationship</label>
                <select value={relationship} onChange={(e) => setRelationship(e.target.value)}
                  className="dark-input w-full rounded-xl p-2.5 text-sm font-medium">
                  {['Parent','Sibling','Spouse','Friend','Guardian','Authority'].map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button type="button" onClick={resetForm}
                  className="py-2 px-4 rounded-xl font-bold text-xs cursor-pointer transition-all"
                  style={{background:'rgba(255,255,255,0.05)', border:'1px solid #1e2d4a', color:'#64748b'}}>
                  Cancel
                </button>
                <button type="submit"
                  className="flex items-center gap-1.5 py-2 px-4 rounded-xl font-bold text-xs cursor-pointer"
                  style={{background:'linear-gradient(135deg,#dc2626,#991b1b)', color:'white', boxShadow:'0 4px 12px rgba(239,68,68,0.3)'}}>
                  <Check className="w-4 h-4" /> Save Contact
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Contacts;
