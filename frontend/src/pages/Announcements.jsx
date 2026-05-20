import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import api from '../api/axios';
import toast from 'react-hot-toast';
import {
  RiAddLine, RiCloseLine, RiEditLine, RiDeleteBinLine,
  RiAlertLine, RiMegaphoneLine, RiCalendarLine,
} from 'react-icons/ri';

const CATEGORIES = [
  { value: 'general',    label: 'General',    color: 'badge-gray' },
  { value: 'gst',        label: 'GST',        color: 'badge-green' },
  { value: 'itr',        label: 'ITR',        color: 'badge-purple' },
  { value: 'deadline',   label: 'Deadline',   color: 'badge-yellow' },
  { value: 'regulatory', label: 'Regulatory', color: 'badge-blue' },
];

const catStyle = Object.fromEntries(CATEGORIES.map(c => [c.value, c.color]));
const catLabel = Object.fromEntries(CATEGORIES.map(c => [c.value, c.label]));

function fmtDate(s) {
  return new Date(s).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

const emptyForm = { title: '', content: '', category: 'general', isImportant: false };

export default function Announcements() {
  const { isCA } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    api.get('/announcements')
      .then(r => setItems(r.data.announcements || []))
      .catch(() => toast.error('Failed to load announcements'))
      .finally(() => setLoading(false));
  }, []);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setShowModal(true); };
  const openEdit = (ann) => { setEditing(ann); setForm({ title: ann.title, content: ann.content, category: ann.category, isImportant: ann.isImportant }); setShowModal(true); };
  const closeModal = () => { setShowModal(false); setEditing(null); setForm(emptyForm); };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) return toast.error('Title and content required');
    setSaving(true);
    try {
      if (editing) {
        const { data } = await api.put(`/announcements/${editing._id}`, form);
        setItems(prev => prev.map(a => a._id === editing._id ? data.announcement : a));
        toast.success('Updated');
      } else {
        const { data } = await api.post('/announcements', form);
        setItems(prev => [data.announcement, ...prev]);
        toast.success('Posted');
      }
      closeModal();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this announcement?')) return;
    try {
      await api.delete(`/announcements/${id}`);
      setItems(prev => prev.filter(a => a._id !== id));
      toast.success('Deleted');
    } catch { toast.error('Delete failed'); }
  };

  const filtered = filter === 'all' ? items : items.filter(a => a.category === filter);

  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-8">

        
        <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between gap-4">
          <div>
            <h1 className="page-title">Announcements</h1>
            <p className="text-sm text-gray-400 mt-1">
              {isCA ? 'Post updates and notices for your team' : 'Updates from your CA'}
            </p>
          </div>
          {isCA && (
            <button onClick={openCreate} className="btn-primary flex-shrink-0">
              <RiAddLine /> New post
            </button>
          )}
        </motion.div>

        
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.05 }}
          className="flex flex-wrap gap-2">
          {[{ value: 'all', label: 'All' }, ...CATEGORIES].map(c => (
            <button key={c.value} onClick={() => setFilter(c.value)}
              className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${
                filter === c.value
                  ? 'bg-gray-900 text-white border-gray-900'
                  : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
              }`}>
              {c.label}
            </button>
          ))}
        </motion.div>

        
        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => <div key={i} className="h-28 shimmer rounded-xl" />)}
          </div>
        ) : filtered.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="py-24 flex flex-col items-center text-gray-400">
            <RiMegaphoneLine className="text-5xl mb-3 text-gray-200" />
            <p className="text-sm font-medium text-gray-500">No announcements yet</p>
            {isCA && <button onClick={openCreate} className="mt-4 text-indigo-600 text-sm hover:underline">Post your first update</button>}
          </motion.div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence initial={false}>
              {filtered.map((ann, i) => (
                <motion.div
                  key={ann._id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ delay: i * 0.04 }}
                  className={`card px-5 py-4 group ${ann.isImportant ? 'border-l-4 border-l-red-400' : ''}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      {ann.isImportant && <RiAlertLine className="text-red-400 flex-shrink-0 mt-0.5 text-base" />}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h3 className="text-sm font-semibold text-gray-900">{ann.title}</h3>
                          <span className={`${catStyle[ann.category]} text-[11px]`}>{catLabel[ann.category]}</span>
                          {ann.isImportant && <span className="badge-red text-[11px]">Important</span>}
                        </div>
                        <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{ann.content}</p>
                        <div className="flex items-center gap-3 mt-2.5">
                          <span className="text-xs text-gray-400 flex items-center gap-1">
                            <RiCalendarLine className="text-xs" /> {fmtDate(ann.createdAt)}
                          </span>
                          <span className="text-xs text-gray-400">by {ann.publishedBy?.name}</span>
                        </div>
                      </div>
                    </div>
                    {isCA && (
                      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                        <button onClick={() => openEdit(ann)}
                          className="p-1.5 rounded-lg hover:bg-indigo-50 text-gray-400 hover:text-indigo-600 transition-colors" title="Edit">
                          <RiEditLine className="text-base" />
                        </button>
                        <button onClick={() => handleDelete(ann._id)}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors" title="Delete">
                          <RiDeleteBinLine className="text-base" />
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)' }}
            onClick={e => e.target === e.currentTarget && closeModal()}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 12 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-gray-100"
            >
              <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900">
                  {editing ? 'Edit announcement' : 'New announcement'}
                </h2>
                <button onClick={closeModal} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-400">
                  <RiCloseLine className="text-lg" />
                </button>
              </div>
              <form onSubmit={handleSave} className="px-6 py-5 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Title *</label>
                  <input type="text" required value={form.title}
                    onChange={e => setForm({ ...form, title: e.target.value })}
                    className="input-field" placeholder="e.g. GST filing deadline reminder" autoFocus />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Content *</label>
                  <textarea rows={4} required value={form.content}
                    onChange={e => setForm({ ...form, content: e.target.value })}
                    className="input-field resize-none" placeholder="Write your announcement…" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5">Category</label>
                    <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="input-field">
                      {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                    </select>
                  </div>
                  <div className="flex items-end pb-1">
                    <label className="flex items-center gap-2.5 cursor-pointer select-none">
                      <input type="checkbox" checked={form.isImportant}
                        onChange={e => setForm({ ...form, isImportant: e.target.checked })}
                        className="w-4 h-4 rounded accent-red-500" />
                      <span className="text-sm font-medium text-gray-700">Mark as important</span>
                    </label>
                  </div>
                </div>
                <div className="flex gap-3 pt-2 border-t border-gray-100">
                  <button type="button" onClick={closeModal} className="btn-secondary flex-1">Cancel</button>
                  <button type="submit" disabled={saving} className="btn-primary flex-1 justify-center">
                    {saving
                      ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      : editing ? 'Save changes' : 'Post'}
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
