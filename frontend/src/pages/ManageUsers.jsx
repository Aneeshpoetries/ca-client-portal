import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Layout from '../components/Layout';
import api from '../api/axios';
import toast from 'react-hot-toast';
import {
  RiAddLine, RiCloseLine, RiUser3Line, RiMailLine,
  RiLockLine, RiPhoneLine, RiCheckLine, RiProhibitedLine,
  RiDeleteBinLine, RiAlertLine,
} from 'react-icons/ri';

const emptyForm = { name: '', email: '', password: '', phone: '' };

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    api.get('/users')
      .then(({ data }) => setUsers(data.users || []))
      .catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.post('/users', form);
      setUsers(prev => [data.user, ...prev]);
      setShowModal(false); setForm(emptyForm);
      toast.success('Staff account created');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const handlePermanentDelete = async () => {
    if (!deleteConfirm) return;
    setDeleting(true);
    try {
      await api.delete(`/users/${deleteConfirm._id}/permanent`);
      setUsers(prev => prev.filter(u => u._id !== deleteConfirm._id));
      setDeleteConfirm(null);
      toast.success('Staff member removed');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove');
    } finally {
      setDeleting(false);
    }
  };

  const toggleActive = async (userId, current) => {
    try {
      await api.put(`/users/${userId}`, { isActive: !current });
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, isActive: !current } : u));
      toast.success(current ? 'Deactivated' : 'Activated');
    } catch { toast.error('Update failed'); }
  };

  return (
    <Layout>
      <div className="max-w-5xl mx-auto">

        
        <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between mb-8">
          <div>
            <h1 className="page-title">Staff</h1>
            <p className="text-sm text-gray-400 mt-1">{users.length} member{users.length !== 1 ? 's' : ''}</p>
          </div>
          <button onClick={() => setShowModal(true)} className="btn-primary">
            <RiAddLine /> Add staff
          </button>
        </motion.div>

        
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.08 }} className="card overflow-hidden">
          {loading ? (
            <div className="divide-y divide-gray-50">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center gap-4 px-5 py-4">
                  <div className="w-9 h-9 shimmer rounded-full" />
                  <div className="flex-1 space-y-2"><div className="h-3.5 shimmer w-1/3" /><div className="h-3 shimmer w-1/4" /></div>
                </div>
              ))}
            </div>
          ) : users.length === 0 ? (
            <div className="py-20 flex flex-col items-center text-gray-400">
              <p className="text-sm font-medium text-gray-500">No staff members yet</p>
              <button onClick={() => setShowModal(true)} className="mt-4 btn-primary text-xs"><RiAddLine /> Add first member</button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-[2fr_2fr_1fr_1fr_auto] gap-4 px-5 py-3 border-b border-gray-100">
                <span className="section-label">Name</span>
                <span className="section-label">Email</span>
                <span className="section-label">Clients</span>
                <span className="section-label">Status</span>
                <span />
              </div>
              <div className="divide-y divide-gray-50">
                {users.map((u, i) => (
                  <motion.div key={u._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                    className="grid grid-cols-[2fr_2fr_1fr_1fr_auto] gap-4 items-center px-5 py-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`avatar w-8 h-8 text-xs flex-shrink-0 ${!u.isActive ? 'opacity-40' : ''}`}>
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <p className="text-sm font-medium text-gray-800 truncate">{u.name}</p>
                    </div>
                    <p className="text-sm text-gray-500 truncate">{u.email}</p>
                    <p className="text-sm text-gray-500">{u.assignedClients?.length || 0}</p>
                    <span className={u.isActive ? 'badge badge-green' : 'badge badge-gray'}>
                      {u.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleActive(u._id, u.isActive)}
                        className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium transition-colors border ${
                          u.isActive
                            ? 'border-red-200 text-red-600 hover:bg-red-50'
                            : 'border-green-200 text-green-700 hover:bg-green-50'
                        }`}
                      >
                        {u.isActive ? <><RiProhibitedLine /> Deactivate</> : <><RiCheckLine /> Activate</>}
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(u)}
                        className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors border border-transparent hover:border-red-100"
                        title="Permanently remove"
                      >
                        <RiDeleteBinLine className="text-sm" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </>
          )}
        </motion.div>
      </div>

      
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)' }}
            onClick={e => e.target === e.currentTarget && !deleting && setDeleteConfirm(null)}>
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 12 }} animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0 }} transition={{ duration: 0.18 }}
              className="bg-white rounded-2xl w-full max-w-sm shadow-2xl border border-gray-100">
              <div className="px-6 pt-6 pb-4 flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-4">
                  <RiAlertLine className="text-2xl text-red-500" />
                </div>
                <h2 className="text-base font-semibold text-gray-900">Remove staff member?</h2>
                <p className="text-sm text-gray-500 mt-2">
                  <span className="font-medium text-gray-800">{deleteConfirm.name}</span> will be permanently removed from the portal and lose all access. This cannot be undone.
                </p>
              </div>
              <div className="flex gap-3 px-6 pb-6">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  disabled={deleting}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePermanentDelete}
                  disabled={deleting}
                  className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-colors"
                >
                  {deleting ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <><RiDeleteBinLine /> Remove</>}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)' }}
            onClick={e => e.target === e.currentTarget && setShowModal(false)}>
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 12 }} animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0 }} transition={{ duration: 0.18 }}
              className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-gray-100">
              <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Add staff member</h2>
                  <p className="text-xs text-gray-400 mt-0.5">Creates a staff-level account</p>
                </div>
                <button onClick={() => setShowModal(false)} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400"><RiCloseLine className="text-lg" /></button>
              </div>
              <form onSubmit={handleCreate} className="px-6 py-5 space-y-4">
                {[
                  { key: 'name',     label: 'Full name',          icon: RiUser3Line, type: 'text',     ph: 'Staff member name',   req: true },
                  { key: 'email',    label: 'Email',               icon: RiMailLine,  type: 'email',    ph: 'staff@email.com',     req: true },
                  { key: 'phone',    label: 'Phone (optional)',     icon: RiPhoneLine, type: 'tel',      ph: '+91 XXXXX XXXXX',     req: false },
                  { key: 'password', label: 'Temporary password',  icon: RiLockLine,  type: 'password', ph: 'Min 6 characters',    req: true },
                ].map(({ key, label, icon: Icon, type, ph, req }) => (
                  <div key={key}>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5">{label}</label>
                    <div className="relative">
                      <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                      <input type={type} required={req} value={form[key]}
                        onChange={e => setForm({ ...form, [key]: e.target.value })}
                        className="input-field pl-9" placeholder={ph} />
                    </div>
                  </div>
                ))}
                <div className="flex gap-3 pt-2 border-t border-gray-100 mt-4">
                  <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
                  <button type="submit" disabled={saving} className="btn-primary flex-1 justify-center">
                    {saving ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : 'Create account'}
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
