import { useEffect, useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import FileCard from '../components/FileCard';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { useDropzone } from 'react-dropzone';
import {
  RiFileTextLine, RiSearchLine, RiUploadCloudLine, RiCloseLine,
  RiFileChartLine, RiAddLine, RiShieldCheckLine, RiUser3Line,
} from 'react-icons/ri';

const DOC_PRIMARY_TABS = [
  { key: 'shared_by_us', label: 'Shared by Us',   desc: 'Files CA & staff uploaded',  icon: RiShieldCheckLine },
  { key: 'from_clients', label: 'From Clients',    desc: 'Files clients submitted',    icon: RiUser3Line       },
];

const CATEGORIES = [
  { value: '',               label: 'All' },
  { value: 'client_document', label: 'Client docs' },
  { value: 'gst_return',     label: 'GST Returns' },
  { value: 'itr',            label: 'ITR' },
  { value: 'other_return',   label: 'Other returns' },
];

const UPLOAD_CATEGORIES = [
  { value: 'client_document', label: 'Client Document' },
  { value: 'gst_return',      label: 'GST Return' },
  { value: 'itr',             label: 'ITR' },
  { value: 'other_return',    label: 'Other Return' },
];

const DOC_TYPE_MAP = {
  client_document: ['bank_statement','invoice','purchase_bill','ledger','balance_sheet','profit_loss','tds_certificate','misc_client'],
  gst_return: ['GSTR-1','GSTR-3B','GSTR-9','GSTR-9C','GSTR-2A','GSTR-2B'],
  itr: ['ITR-1','ITR-2','ITR-3','ITR-4','ITR-5','ITR-6','form_16','form_26AS','tax_audit'],
  other_return: ['other'],
};

const CURRENT_YEAR = new Date().getFullYear();
const FY_YEARS = Array.from({ length: 11 }, (_, i) => {
  const y = CURRENT_YEAR - i;
  return { value: `${y}-${y + 1}`, label: `FY ${y}–${String(y + 1).slice(2)}` };
});

const emptyForm = { clientId: '', category: '', documentType: '', description: '', financialYear: '', quarter: '', year: '' };

export default function Documents() {
  const { isCA } = useAuth();
  const { search: qs } = useLocation();
  const [documents, setDocuments] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,     setSearch]     = useState('');
  const [cat,        setCat]        = useState(() => new URLSearchParams(qs).get('category') || '');
  const [primaryTab, setPrimaryTab] = useState(() => new URLSearchParams(qs).get('primary') || 'shared_by_us');

  // Sync from sidebar nav links
  useEffect(() => {
    const params = new URLSearchParams(qs);
    const p = params.get('primary');
    const c = params.get('category');
    if (p) setPrimaryTab(p);
    if (c !== null) setCat(c || '');
  }, [qs]);
  const [showUpload, setShowUpload] = useState(false);
  const [uploadForm, setUploadForm] = useState(emptyForm);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const onDrop = useCallback(files => setFile(files[0]), []);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, multiple: false,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'image/*': ['.jpg', '.jpeg', '.png'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
  });

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const { data: { clients: cl = [] } } = await api.get('/clients');
        setClients(cl);
        const allDocs = [];
        await Promise.all(cl.map(async (client) => {
          try {
            const { data: { documents: docs = [] } } = await api.get(`/documents/client/${client._id}`);
            allDocs.push(...docs.map(d => ({ ...d, _clientName: client.name })));
          } catch {}
        }));
        allDocs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setDocuments(allDocs);
      } catch { toast.error('Failed to load'); }
      finally { setLoading(false); }
    };
    fetchAll();
  }, []);

  const closeModal = () => { setShowUpload(false); setFile(null); setUploadForm(emptyForm); };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return toast.error('Select a file');
    if (!uploadForm.clientId) return toast.error('Select a client');
    if (!uploadForm.category) return toast.error('Select a category');
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      Object.entries(uploadForm).forEach(([k, v]) => { if (v) fd.append(k, v); });
      const { data } = await api.post('/documents/upload', fd);
      const clientName = clients.find(c => c._id === uploadForm.clientId)?.name || '';
      setDocuments(prev => [{ ...data.document, _clientName: clientName }, ...prev]);
      closeModal();
      toast.success('Uploaded!');
    } catch (err) { toast.error(err.response?.data?.message || 'Upload failed'); }
    finally { setUploading(false); }
  };

  const primaryFiltered = documents.filter(d =>
    primaryTab === 'shared_by_us'
      ? d.uploadedBy?.role !== 'client'
      : d.uploadedBy?.role === 'client'
  );

  const primaryCounts = {
    shared_by_us: documents.filter(d => d.uploadedBy?.role !== 'client').length,
    from_clients:  documents.filter(d => d.uploadedBy?.role === 'client').length,
  };

  const filtered = primaryFiltered.filter(d => {
    const s = search.toLowerCase();
    const matchSearch = !search ||
      d.originalName.toLowerCase().includes(s) ||
      (d._clientName || '').toLowerCase().includes(s) ||
      (d.documentType || '').toLowerCase().includes(s);
    return matchSearch && (!cat || d.category === cat);
  });

  const grouped = filtered.reduce((acc, doc) => {
    const key = doc._clientName || 'Unknown';
    if (!acc[key]) acc[key] = [];
    acc[key].push(doc);
    return acc;
  }, {});

  const isReturn = uploadForm.category && uploadForm.category !== 'client_document';

  return (
    <Layout>
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-start justify-between mb-8 gap-4">
          <div>
            <h1 className="page-title">{isCA ? 'All Documents' : 'My Uploads'}</h1>
            <p className="text-sm text-gray-400 mt-1">{documents.length} file{documents.length !== 1 ? 's' : ''} total</p>
          </div>
          <button onClick={() => setShowUpload(true)} className="btn-primary flex-shrink-0">
            <RiUploadCloudLine /> Upload file
          </button>
        </motion.div>

        {/* Primary folder tabs */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.04 }}
          className="grid grid-cols-2 gap-3 mb-5">
          {DOC_PRIMARY_TABS.map(pt => {
            const active = primaryTab === pt.key;
            const count  = loading ? null : primaryCounts[pt.key];
            return (
              <motion.button key={pt.key} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                onClick={() => { setPrimaryTab(pt.key); setCat(''); }}
                className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left ${
                  active
                    ? 'border-gray-900 bg-gray-900 shadow-md'
                    : 'border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  active ? 'bg-white/10' : pt.key === 'shared_by_us' ? 'bg-indigo-50' : 'bg-amber-50'
                }`}>
                  <pt.icon className={`text-xl ${
                    active ? 'text-white' : pt.key === 'shared_by_us' ? 'text-indigo-600' : 'text-amber-600'
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
        </motion.div>

        {/* Filters */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.06 }}
          className="flex items-center gap-3 mb-6 flex-wrap">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              className="input-field pl-9" placeholder="Search files, clients…" />
          </div>
          <div className="flex gap-1 bg-gray-100 rounded-lg p-1 flex-wrap">
            {CATEGORIES.map(c => (
              <button key={c.value} onClick={() => setCat(c.value)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  cat === c.value ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}>
                {c.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Content */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(8)].map((_, i) => <div key={i} className="h-16 shimmer rounded-xl" />)}
          </div>
        ) : filtered.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="py-20 flex flex-col items-center text-gray-400">
            <RiFileTextLine className="text-4xl mb-3 text-gray-200" />
            <p className="text-sm font-medium text-gray-500">No documents found</p>
            <button onClick={() => setShowUpload(true)} className="mt-4 btn-primary text-xs">
              <RiAddLine /> Upload your first file
            </button>
          </motion.div>
        ) : (
          <motion.div initial="hidden" animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.03 } } }}
            className="space-y-8">
            {Object.entries(grouped).map(([clientName, docs]) => (
              <div key={clientName}>
                <div className="flex items-center gap-3 mb-3">
                  <span className="section-label">{clientName}</span>
                  <div className="flex-1 h-px bg-gray-100" />
                  <span className="text-xs text-gray-400">{docs.length}</span>
                </div>
                <div className="space-y-2">
                  {docs.map((doc, i) => (
                    <motion.div key={doc._id}
                      variants={{ hidden: { opacity: 0, y: 6 }, visible: { opacity: 1, y: 0 } }}>
                      <FileCard doc={doc} delay={i * 0.02}
                        onDelete={id => setDocuments(prev => prev.filter(d => d._id !== id))} />
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Upload modal */}
      <AnimatePresence>
        {showUpload && (
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
              className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Upload document</h2>
                  <p className="text-xs text-gray-400 mt-0.5">Attach a file to a client record</p>
                </div>
                <button onClick={closeModal} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-400">
                  <RiCloseLine className="text-lg" />
                </button>
              </div>

              <form onSubmit={handleUpload} className="px-6 py-5 space-y-4">

                {/* Client picker */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Client *</label>
                  <select required value={uploadForm.clientId}
                    onChange={e => setUploadForm({ ...uploadForm, clientId: e.target.value })}
                    className="input-field">
                    <option value="">Select client…</option>
                    {clients.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Category *</label>
                  <div className="grid grid-cols-2 gap-2">
                    {UPLOAD_CATEGORIES.map(uc => (
                      <button key={uc.value} type="button"
                        onClick={() => setUploadForm({ ...uploadForm, category: uc.value, documentType: '' })}
                        className={`px-3 py-2 rounded-lg border text-sm font-medium transition-all text-left ${
                          uploadForm.category === uc.value
                            ? 'border-gray-900 bg-gray-900 text-white'
                            : 'border-gray-200 text-gray-600 hover:border-gray-300'
                        }`}>
                        {uc.value === 'gst_return' && <RiFileChartLine className="inline mr-1.5 text-green-500" />}
                        {uc.value === 'itr' && <RiFileChartLine className="inline mr-1.5 text-purple-500" />}
                        {uc.value === 'client_document' && <RiFileTextLine className="inline mr-1.5 text-blue-500" />}
                        {uc.value === 'other_return' && <RiFileChartLine className="inline mr-1.5 text-amber-500" />}
                        {uc.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Document type */}
                {uploadForm.category && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5">Document type</label>
                    <select value={uploadForm.documentType}
                      onChange={e => setUploadForm({ ...uploadForm, documentType: e.target.value })}
                      className="input-field">
                      <option value="">Select type…</option>
                      {(DOC_TYPE_MAP[uploadForm.category] || []).map(t => (
                        <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Period fields */}
                {isReturn && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1.5">Financial year</label>
                      <select value={uploadForm.financialYear}
                        onChange={e => setUploadForm({ ...uploadForm, financialYear: e.target.value })}
                        className="input-field">
                        <option value="">Select FY…</option>
                        {FY_YEARS.map(y => <option key={y.value} value={y.value}>{y.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1.5">Quarter</label>
                      <select value={uploadForm.quarter}
                        onChange={e => setUploadForm({ ...uploadForm, quarter: e.target.value })}
                        className="input-field">
                        <option value="">All year</option>
                        {['Q1 (Apr–Jun)', 'Q2 (Jul–Sep)', 'Q3 (Oct–Dec)', 'Q4 (Jan–Mar)'].map((q, i) => (
                          <option key={i} value={`Q${i + 1}`}>{q}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {/* Dropzone */}
                <div {...getRootProps()} className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                  isDragActive ? 'border-indigo-400 bg-indigo-50' :
                  file ? 'border-green-400 bg-green-50' :
                  'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}>
                  <input {...getInputProps()} />
                  {file ? (
                    <>
                      <RiFileTextLine className="text-2xl text-green-600 mx-auto mb-2" />
                      <p className="text-sm font-medium text-gray-800">{file.name}</p>
                      <p className="text-xs text-gray-400 mt-1">{(file.size / 1024).toFixed(1)} KB · click to change</p>
                    </>
                  ) : (
                    <>
                      <RiUploadCloudLine className="text-3xl text-gray-300 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">{isDragActive ? 'Drop it here' : 'Drag & drop or click to browse'}</p>
                      <p className="text-xs text-gray-400 mt-1">PDF, Excel, Images, Word — up to 50 MB</p>
                    </>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Notes (optional)</label>
                  <textarea rows={2} value={uploadForm.description}
                    onChange={e => setUploadForm({ ...uploadForm, description: e.target.value })}
                    className="input-field resize-none" placeholder="Brief description…" />
                </div>

                <div className="flex gap-3 pt-2 border-t border-gray-100">
                  <button type="button" onClick={closeModal} className="btn-secondary flex-1">Cancel</button>
                  <button type="submit" disabled={uploading || !file} className="btn-primary flex-1 justify-center">
                    {uploading
                      ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      : <><RiUploadCloudLine /> Upload</>}
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
