import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import FileCard from '../components/FileCard';
import api from '../api/axios';
import toast from 'react-hot-toast';
import {
  RiFileTextLine, RiAlertLine, RiMegaphoneLine, RiShieldCheckLine,
  RiBuilding2Line, RiArrowRightLine, RiBellLine, RiCalendarLine,
  RiFileChartLine, RiFilePdfLine, RiFolder3Line, RiUploadCloud2Line,
  RiCloseLine, RiCheckLine,
} from 'react-icons/ri';

const PRIMARY_TABS = [
  { key: 'my_uploads', label: 'My Uploads',  desc: 'Files you submitted',        icon: RiUploadCloud2Line },
  { key: 'from_ca',    label: 'From CA',     desc: 'Files shared by your CA',    icon: RiShieldCheckLine  },
];

const SUB_TABS = [
  { key: 'all',             label: 'All',           icon: RiFolder3Line   },
  { key: 'client_document', label: 'Documents',     icon: RiFileTextLine  },
  { key: 'gst_return',      label: 'GST Returns',   icon: RiFileChartLine },
  { key: 'itr',             label: 'ITR',           icon: RiFilePdfLine   },
  { key: 'other_return',    label: 'Other Returns', icon: RiFilePdfLine   },
];

const GST_TYPES = [
  { value: 'bank_statement', label: 'Bank Statement' },
  { value: 'sales_invoice',  label: 'Sales Invoice'  },
  { value: 'purchase_bill',  label: 'Purchase Bill'  },
];
const ITR_TYPES = [
  { value: 'form_16',            label: 'Form 16'            },
  { value: 'investment_details', label: 'Investment Details' },
  { value: 'fdr_statement',      label: 'FDR Statement'      },
  { value: 'rental_income',      label: 'Rental Income'      },
];

const CAT_COLORS = {
  general:    { bg: 'bg-gray-100',  text: 'text-gray-600'  },
  gst:        { bg: 'bg-green-50',  text: 'text-green-700' },
  itr:        { bg: 'bg-purple-50', text: 'text-purple-700'},
  deadline:   { bg: 'bg-red-50',    text: 'text-red-700'   },
  regulatory: { bg: 'bg-amber-50',  text: 'text-amber-700' },
};

function fmtDate(s) {
  return new Date(s).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function SlideNewsTicker({ items }) {
  const [current, setCurrent] = useState(0);
  const [dir, setDir] = useState(1);

  useEffect(() => {
    if (items.length <= 1) return;
    const id = setInterval(() => { setDir(1); setCurrent(i => (i + 1) % items.length); }, 4000);
    return () => clearInterval(id);
  }, [items.length]);

  if (!items.length) return null;
  const ann = items[current];
  const go = (i) => { setDir(i > current ? 1 : -1); setCurrent(i); };

  return (
    <div className="bg-gray-900 text-white rounded-xl overflow-hidden shadow-sm">
      <div className="flex items-stretch">
        <div className="flex items-center gap-2 px-4 py-3 bg-indigo-600 flex-shrink-0">
          <RiBellLine className="animate-pulse" />
          <span className="text-xs font-bold tracking-wider uppercase whitespace-nowrap">Updates</span>
        </div>
        <div className="relative flex-1 overflow-hidden" style={{ height: 48 }}>
          <AnimatePresence mode="wait" custom={dir}>
            <motion.div
              key={current} custom={dir}
              variants={{
                enter: d => ({ x: d * 40, opacity: 0 }),
                center: { x: 0, opacity: 1 },
                exit: d => ({ x: d * -40, opacity: 0 }),
              }}
              initial="enter" animate="center" exit="exit"
              transition={{ duration: 0.35, ease: 'easeInOut' }}
              className="absolute inset-0 flex items-center gap-3 px-4"
            >
              {ann.isImportant && <RiAlertLine className="text-red-400 flex-shrink-0" />}
              <span className={`text-sm font-medium truncate ${ann.isImportant ? 'text-red-300' : 'text-gray-100'}`}>
                {ann.title}
              </span>
              <span className="text-gray-500 text-xs flex-shrink-0 hidden sm:block">{fmtDate(ann.createdAt)}</span>
            </motion.div>
          </AnimatePresence>
        </div>
        {items.length > 1 && (
          <div className="flex items-center gap-1.5 px-4 flex-shrink-0">
            {items.map((_, i) => (
              <button key={i} onClick={() => go(i)}
                className={`rounded-full transition-all duration-200 ${
                  i === current ? 'w-4 h-1.5 bg-indigo-400' : 'w-1.5 h-1.5 bg-gray-600 hover:bg-gray-400'
                }`} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function UploadModal({ category, types, clientId, onClose, onUploaded }) {
  const [docType,   setDocType]   = useState(types[0].value);
  const [file,      setFile]      = useState(null);
  const [uploading, setUploading] = useState(false);
  const [dragging,  setDragging]  = useState(false);

  const isGst       = category === 'gst_return';
  const headerBg    = isGst ? 'bg-emerald-50' : 'bg-purple-50';
  const selectedCls = isGst
    ? 'border-emerald-400 bg-emerald-50 text-emerald-700'
    : 'border-purple-400 bg-purple-50 text-purple-700';

  const handleSubmit = async () => {
    if (!file) return toast.error('Please select a file');
    setUploading(true);
    const form = new FormData();
    form.append('file', file);
    form.append('clientId', clientId);
    form.append('category', category);
    form.append('documentType', docType);
    try {
      await api.post('/documents/upload', form);
      toast.success('File uploaded successfully');
      onUploaded();
      onClose();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.45)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div initial={{ scale: 0.95, y: 12 }} animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 12 }} transition={{ duration: 0.2 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
      >
        <div className={`px-6 py-4 ${headerBg} flex items-center justify-between`}>
          <div>
            <h3 className="font-semibold text-gray-900">Upload {isGst ? 'GST' : 'ITR'} Document</h3>
            <p className="text-xs text-gray-500 mt-0.5">Select type and attach your file</p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-white/60 rounded-lg transition-colors">
            <RiCloseLine className="text-gray-500 text-lg" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-2">Document Type</label>
            <div className="grid grid-cols-2 gap-2">
              {types.map(t => (
                <button key={t.value} onClick={() => setDocType(t.value)}
                  className={`px-3 py-2.5 rounded-xl border text-sm font-medium transition-all text-left ${
                    docType === t.value ? selectedCls : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                  }`}>
                  {docType === t.value && <RiCheckLine className="inline mr-1 text-xs" />}
                  {t.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-2">File</label>
            <div
              onDragOver={e => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={e => { e.preventDefault(); setDragging(false); if (e.dataTransfer.files[0]) setFile(e.dataTransfer.files[0]); }}
              onClick={() => document.getElementById('portal-file-input').click()}
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
                dragging ? 'border-indigo-400 bg-indigo-50' :
                file    ? 'border-green-400 bg-green-50' :
                          'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <input id="portal-file-input" type="file" className="hidden"
                accept=".pdf,.jpg,.jpeg,.png,.xls,.xlsx,.doc,.docx,.csv"
                onChange={e => { if (e.target.files[0]) setFile(e.target.files[0]); }} />
              {file ? (
                <div className="flex items-center justify-center gap-3">
                  <RiCheckLine className="text-green-500 text-xl flex-shrink-0" />
                  <div className="text-left min-w-0">
                    <p className="text-sm font-medium text-gray-700 truncate max-w-[180px]">{file.name}</p>
                    <p className="text-xs text-gray-400">{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                  <button onClick={e => { e.stopPropagation(); setFile(null); }}
                    className="ml-auto p-1 hover:bg-red-50 rounded-lg flex-shrink-0">
                    <RiCloseLine className="text-red-400" />
                  </button>
                </div>
              ) : (
                <>
                  <RiUploadCloud2Line className="text-3xl text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Click or drag file here</p>
                  <p className="text-xs text-gray-400 mt-1">PDF, Excel, Word, Image, CSV · max 50 MB</p>
                </>
              )}
            </div>
          </div>
          <div className="flex gap-3 pt-1">
            <button onClick={onClose} className="flex-1 btn-outline py-2.5 text-sm">Cancel</button>
            <button onClick={handleSubmit} disabled={uploading || !file}
              className="flex-1 btn py-2.5 text-sm disabled:opacity-50 disabled:cursor-not-allowed">
              {uploading ? 'Uploading…' : 'Upload'}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function AnnouncementCard({ ann, index }) {
  const [expanded, setExpanded] = useState(false);
  const colors = CAT_COLORS[ann.category] || CAT_COLORS.general;
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.06 }}
      className={`card overflow-hidden cursor-pointer group ${ann.isImportant ? 'border-l-4 border-l-red-400' : ''}`}
      onClick={() => setExpanded(v => !v)}
    >
      <div className="px-4 py-3.5 flex items-start gap-3">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${colors.bg}`}>
          {ann.isImportant ? <RiAlertLine className="text-sm text-red-500" /> : <RiMegaphoneLine className={`text-sm ${colors.text}`} />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className={`text-sm font-semibold ${ann.isImportant ? 'text-red-700' : 'text-gray-900'}`}>{ann.title}</p>
            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md uppercase tracking-wide ${colors.bg} ${colors.text}`}>
              {ann.category}
            </span>
          </div>
          <AnimatePresence>
            {expanded && (
              <motion.p initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
                className="text-xs text-gray-600 mt-1.5 leading-relaxed overflow-hidden">
                {ann.content}
              </motion.p>
            )}
          </AnimatePresence>
          {!expanded && <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{ann.content}</p>}
        </div>
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          <span className="text-[11px] text-gray-400 flex items-center gap-1">
            <RiCalendarLine className="text-[10px]" />{fmtDate(ann.createdAt)}
          </span>
          <span className="text-[10px] text-indigo-500 font-medium group-hover:text-indigo-700 transition-colors">
            {expanded ? 'Show less ▲' : 'Read more ▼'}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

export default function ClientPortal() {
  const { user } = useAuth();
  const { search: qs } = useLocation();
  const clientId   = user?.linkedClient?._id || user?.linkedClient;
  const clientName = user?.linkedClient?.name || user?.name;

  const [documents,     setDocuments]     = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [primaryTab,    setPrimaryTab]    = useState(() => new URLSearchParams(qs).get('primary') || 'my_uploads');
  const [subTab,        setSubTab]        = useState(() => new URLSearchParams(qs).get('sub') || 'all');
  const [uploadModal,   setUploadModal]   = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(qs);
    const p = params.get('primary');
    const s = params.get('sub');
    if (p) setPrimaryTab(p);
    setSubTab(s || 'all');
  }, [qs]);

  useEffect(() => {
    if (!clientId) return;
    Promise.all([
      api.get(`/documents/client/${clientId}`),
      api.get('/announcements'),
    ])
      .then(([docRes, annRes]) => {
        setDocuments(docRes.data.documents || []);
        setAnnouncements(annRes.data.announcements || []);
      })
      .catch(() => toast.error('Failed to load your data'))
      .finally(() => setLoading(false));
  }, [clientId]);

  const reloadDocs = () => {
    if (!clientId) return;
    api.get(`/documents/client/${clientId}`)
      .then(r => setDocuments(r.data.documents || []))
      .catch(() => {});
  };

  const myDocs  = documents.filter(d => d.uploadedBy?._id === user?._id || d.uploadedBy?.role === 'client');
  const caDocs  = documents.filter(d => d.uploadedBy?.role === 'ca' || d.uploadedBy?.role === 'staff');
  const bucket  = primaryTab === 'my_uploads' ? myDocs : caDocs;

  const filtered = subTab === 'all' ? bucket : bucket.filter(d => d.category === subTab);

  const primaryCounts = { my_uploads: myDocs.length, from_ca: caDocs.length };

  const subCounts = {
    all:             bucket.length,
    client_document: bucket.filter(d => d.category === 'client_document').length,
    gst_return:      bucket.filter(d => d.category === 'gst_return').length,
    itr:             bucket.filter(d => d.category === 'itr').length,
    other_return:    bucket.filter(d => d.category === 'other_return').length,
  };

  const totalCounts = {
    all:             documents.length,
    client_document: documents.filter(d => d.category === 'client_document').length,
    gst_return:      documents.filter(d => d.category === 'gst_return').length,
    itr:             documents.filter(d => d.category === 'itr').length,
  };

  const now = new Date();
  const greeting = now.getHours() < 12 ? 'Good morning' : now.getHours() < 17 ? 'Good afternoon' : 'Good evening';
  const recentAnns = announcements.slice(0, 6);

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-8">

        
        {announcements.length > 0 && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <SlideNewsTicker items={announcements} />
          </motion.div>
        )}

        
        <motion.section initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.05 }}>
          <p className="text-sm text-gray-400 mb-1">
            {now.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            {greeting}, {user?.name?.split(' ')[0]}.
          </h1>
          <div className="flex items-center gap-2 mt-2">
            <RiBuilding2Line className="text-gray-400 text-sm" />
            <span className="text-sm text-gray-500">{clientName}</span>
            <span className="ml-2 inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-600">
              <RiShieldCheckLine className="text-xs" /> Client Portal
            </span>
          </div>
          <div className="flex flex-wrap gap-8 mt-6">
            {[
              { label: 'Total Files', value: totalCounts.all },
              { label: 'Documents',   value: totalCounts.client_document },
              { label: 'GST Returns', value: totalCounts.gst_return },
              { label: 'ITR',         value: totalCounts.itr },
            ].map((m, i) => (
              <motion.div key={m.label} className="metric"
                initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 + i * 0.05, type: 'spring', stiffness: 260, damping: 20 }}>
                <span className="metric-value">{loading ? '—' : m.value}</span>
                <span className="metric-label">{m.label}</span>
              </motion.div>
            ))}
          </div>
        </motion.section>

        
        <section>
          <h2 className="text-base font-semibold text-gray-900 mb-4">Upload Documents</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="card p-5 border border-emerald-100 hover:border-emerald-300 transition-colors">
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
                  <RiFileChartLine className="text-xl text-emerald-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 text-sm">GST Documents</h3>
                  <p className="text-xs text-gray-400 mt-0.5 mb-3">Bank Statement · Sales Invoice · Purchase Bill</p>
                  <button onClick={() => setUploadModal('gst_return')}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-colors">
                    <RiUploadCloud2Line /> Upload File
                  </button>
                </div>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
              className="card p-5 border border-purple-100 hover:border-purple-300 transition-colors">
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-purple-50 flex items-center justify-center flex-shrink-0">
                  <RiFilePdfLine className="text-xl text-purple-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 text-sm">ITR Documents</h3>
                  <p className="text-xs text-gray-400 mt-0.5 mb-3">Form 16 · Investment Details · FDR · Rental Income</p>
                  <button onClick={() => setUploadModal('itr')}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-lg transition-colors">
                    <RiUploadCloud2Line /> Upload File
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        
        {recentAnns.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-gray-900">Updates from your CA</h2>
              <a href="/announcements" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1 transition-colors">
                View all <RiArrowRightLine />
              </a>
            </div>
            <div className="space-y-2">
              {recentAnns.map((ann, i) => <AnnouncementCard key={ann._id} ann={ann} index={i} />)}
            </div>
          </section>
        )}

        
        <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          <h2 className="text-base font-semibold text-gray-900 mb-4">Your Files</h2>

          
          <div className="grid grid-cols-2 gap-3 mb-5">
            {PRIMARY_TABS.map(pt => {
              const active = primaryTab === pt.key;
              const count  = loading ? null : primaryCounts[pt.key];
              return (
                <motion.button key={pt.key} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                  onClick={() => { setPrimaryTab(pt.key); setSubTab('all'); }}
                  className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left ${
                    active
                      ? 'border-gray-900 bg-gray-900 shadow-md'
                      : 'border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    active ? 'bg-white/10' : pt.key === 'my_uploads' ? 'bg-indigo-50' : 'bg-emerald-50'
                  }`}>
                    <pt.icon className={`text-xl ${
                      active ? 'text-white' : pt.key === 'my_uploads' ? 'text-indigo-600' : 'text-emerald-600'
                    }`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className={`font-semibold text-sm ${active ? 'text-white' : 'text-gray-800'}`}>{pt.label}</div>
                    <div className={`text-xs truncate ${active ? 'text-gray-400' : 'text-gray-400'}`}>{pt.desc}</div>
                  </div>
                  <span className={`text-xl font-bold flex-shrink-0 ${active ? 'text-white' : 'text-gray-700'}`}>
                    {count ?? '—'}
                  </span>
                </motion.button>
              );
            })}
          </div>

          
          <div className="flex items-center gap-0.5 border-b border-gray-100 mb-5 overflow-x-auto">
            {SUB_TABS.map(st => (
              <button key={st.key} onClick={() => setSubTab(st.key)}
                className={`relative px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                  subTab === st.key ? 'text-gray-900' : 'text-gray-400 hover:text-gray-700'
                }`}>
                <st.icon className="text-xs" />
                {st.label}
                {subCounts[st.key] > 0 && (
                  <span className="ml-0.5 text-xs text-gray-400">({subCounts[st.key]})</span>
                )}
                {subTab === st.key && (
                  <motion.div layoutId="portal-sub-tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900 rounded-full" />
                )}
              </button>
            ))}
          </div>

          
          {loading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => <div key={i} className="h-16 shimmer rounded-xl" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 flex flex-col items-center">
              <RiFileTextLine className="text-4xl mb-3 text-gray-200" />
              <p className="text-sm text-gray-500">
                {primaryTab === 'my_uploads' ? 'No files uploaded yet' : 'No files from your CA yet'}
              </p>
              {primaryTab === 'my_uploads' && (
                <p className="text-xs text-gray-400 mt-1">Use the upload cards above to submit your files</p>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map((doc, i) => (
                <FileCard key={doc._id} doc={doc} delay={i * 0.03} onDelete={null} />
              ))}
            </div>
          )}
        </motion.section>

      </div>

      <AnimatePresence>
        {uploadModal && (
          <UploadModal
            category={uploadModal}
            types={uploadModal === 'gst_return' ? GST_TYPES : ITR_TYPES}
            clientId={clientId}
            onClose={() => setUploadModal(null)}
            onUploaded={reloadDocs}
          />
        )}
      </AnimatePresence>
    </Layout>
  );
}
