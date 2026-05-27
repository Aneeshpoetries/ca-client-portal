import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Layout from '../components/Layout';
import api from '../api/axios';
import toast from 'react-hot-toast';
import {
  RiAddLine, RiSearchLine, RiCloseLine, RiArrowRightLine,
  RiBuilding2Line, RiMapPinLine,
} from 'react-icons/ri';

const BUSINESS_TYPES = [
  { value: 'proprietorship', label: 'Proprietorship' },
  { value: 'partnership', label: 'Partnership' },
  { value: 'pvt_ltd', label: 'Pvt Ltd' },
  { value: 'ltd', label: 'Ltd' },
  { value: 'llp', label: 'LLP' },
  { value: 'other', label: 'Other' },
];

const emptyForm = {
  name: '', gstin: '', pan: '', email: '', phone: '',
  businessType: 'other', industry: '', notes: '',
  address: { street: '', city: '', state: '', pincode: '' },
};

const BIZ_LABEL = { proprietorship: 'Proprietorship', partnership: 'Partnership', pvt_ltd: 'Pvt Ltd', ltd: 'Ltd', llp: 'LLP', other: 'Other' };

export default function Clients() {
  const { isCA } = useAuth();
  const { isDark } = useTheme();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/clients')
      .then(({ data }) => setClients(data.clients || []))
      .catch(() => toast.error('Failed to load clients'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = clients.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.gstin || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.pan || '').toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.post('/clients', form);
      setClients(prev => [data.client, ...prev]);
      setShowModal(false);
      setForm(emptyForm);
      toast.success('Client added');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create client');
    } finally { setSaving(false); }
  };

  return (
    <Layout>
      <div className="max-w-5xl mx-auto">

        
        <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between mb-8">
          <div>
            <h1 className="page-title">{isCA ? 'Clients' : 'My Clients'}</h1>
            <p className="text-sm mt-1" style={{ color: 'var(--c-text-3)' }}>{clients.length} total</p>
          </div>
          {isCA && (
            <button onClick={() => setShowModal(true)} className="btn-primary">
              <RiAddLine /> New client
            </button>
          )}
        </motion.div>

        
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.06 }} className="mb-6">
          <div className="relative max-w-sm">
            <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: 'var(--c-text-3)' }} />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input-field pl-9 text-sm"
              placeholder="Search by name, GSTIN, PAN…"
            />
          </div>
        </motion.div>

        
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="card overflow-hidden">
          {loading ? (
            <div style={{ borderColor: 'var(--border-subtle)' }}>
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex items-center gap-4 px-5 py-4" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <div className="w-8 h-8 shimmer rounded-full flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3.5 shimmer w-1/3" />
                    <div className="h-3 shimmer w-1/5" />
                  </div>
                  <div className="h-3 shimmer w-24" />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-20 flex flex-col items-center" style={{ color: 'var(--c-text-3)' }}>
              <p className="text-sm font-medium" style={{ color: 'var(--c-text-2)' }}>{search ? 'No results found' : 'No clients yet'}</p>
              {isCA && !search && (
                <button onClick={() => setShowModal(true)} className="mt-4 btn-primary text-xs">
                  <RiAddLine /> Add your first client
                </button>
              )}
            </div>
          ) : (
            <>

              <div className="grid grid-cols-[2fr_1.5fr_1fr_1fr_40px] gap-4 px-5 py-3" style={{ borderBottom: '1px solid var(--c-border)' }}>
                <span className="section-label">Name</span>
                <span className="section-label">GSTIN / PAN</span>
                <span className="section-label">Type</span>
                <span className="section-label">Docs</span>
                <span />
              </div>

              <div>
                {filtered.map((client, i) => (
                  <motion.div
                    key={client._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    style={{ borderBottom: '1px solid var(--border-subtle)' }}
                  >
                    <Link
                      to={`/clients/${client._id}`}
                      className="grid grid-cols-[2fr_1.5fr_1fr_1fr_40px] gap-4 items-center px-5 py-4 transition-colors group"
                      style={{ textDecoration: 'none' }}
                      onMouseEnter={e => e.currentTarget.style.background = isDark ? 'rgba(22,34,52,0.40)' : '#f8fafc'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >

                      <div className="flex items-center gap-3 min-w-0">
                        <div className="avatar w-8 h-8 text-xs flex-shrink-0">
                          {client.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium transition-colors truncate" style={{ color: 'var(--c-text-1)' }}>{client.name}</p>
                          {client.address?.city && (
                            <p className="text-xs flex items-center gap-1 mt-0.5" style={{ color: 'var(--c-text-3)' }}>
                              <RiMapPinLine className="text-[10px]" /> {client.address.city}
                            </p>
                          )}
                        </div>
                      </div>


                      <div className="min-w-0">
                        {client.gstin ? (
                          <p className="text-xs font-mono truncate" style={{ color: 'var(--c-text-2)' }}>{client.gstin}</p>
                        ) : client.pan ? (
                          <p className="text-xs font-mono truncate" style={{ color: 'var(--c-text-2)' }}>{client.pan}</p>
                        ) : (
                          <span className="text-xs" style={{ color: 'var(--c-text-3)' }}>—</span>
                        )}
                      </div>


                      <span className="badge badge-gray">{BIZ_LABEL[client.businessType] || 'Other'}</span>


                      <span className="text-sm" style={{ color: 'var(--c-text-2)' }}>{client.documentCount || 0}</span>


                      <RiArrowRightLine style={{ color: 'var(--c-border-strong)' }} className="transition-colors group-hover:opacity-100" />
                    </Link>
                  </motion.div>
                ))}
              </div>
            </>
          )}
        </motion.div>
      </div>

      
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)' }}
            onClick={e => e.target === e.currentTarget && setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 12 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="glass-panel rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: '1px solid var(--c-border)' }}>
                <div>
                  <h2 className="text-lg font-semibold" style={{ color: 'var(--c-text-1)' }}>New client</h2>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--c-text-3)' }}>Add a new client to your portal</p>
                </div>
                <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg transition-colors" style={{ color: 'var(--c-text-3)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--c-surface-2)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <RiCloseLine className="text-lg" />
                </button>
              </div>

              <form onSubmit={handleCreate} className="px-6 py-5 space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--c-text-3)' }}>Client name *</label>
                    <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="input-field" placeholder="Full name or business name" />
                  </div>
                  {[
                    { key: 'gstin', label: 'GSTIN', ph: '22AAAAA0000A1Z5' },
                    { key: 'pan',   label: 'PAN',   ph: 'AAAAA0000A' },
                    { key: 'email', label: 'Email', ph: 'client@email.com', type: 'email' },
                    { key: 'phone', label: 'Phone', ph: '+91 XXXXX XXXXX' },
                    { key: 'industry', label: 'Industry', ph: 'e.g. Manufacturing' },
                  ].map(({ key, label, ph, type }) => (
                    <div key={key}>
                      <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--c-text-3)' }}>{label}</label>
                      <input type={type || 'text'} value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} className="input-field" placeholder={ph} />
                    </div>
                  ))}
                  <div>
                    <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--c-text-3)' }}>Business type</label>
                    <select value={form.businessType} onChange={e => setForm({ ...form, businessType: e.target.value })} className="input-field">
                      {BUSINESS_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--c-text-3)' }}>City</label>
                    <input value={form.address.city} onChange={e => setForm({ ...form, address: { ...form.address, city: e.target.value } })} className="input-field" placeholder="Mumbai" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--c-text-3)' }}>State</label>
                    <input value={form.address.state} onChange={e => setForm({ ...form, address: { ...form.address, state: e.target.value } })} className="input-field" placeholder="Maharashtra" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--c-text-3)' }}>Notes</label>
                    <textarea rows={2} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} className="input-field resize-none" placeholder="Any additional notes…" />
                  </div>
                </div>

                <div className="flex gap-3 pt-1 mt-5" style={{ borderTop: '1px solid var(--c-border)' }}>
                  <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
                  <button type="submit" disabled={saving} className="btn-primary flex-1 justify-center">
                    {saving ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : 'Create client'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  );
}
