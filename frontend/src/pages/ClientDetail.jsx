import { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import FileCard from '../components/FileCard';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { useDropzone } from 'react-dropzone';
import {
  RiArrowLeftLine, RiBuilding2Line, RiMailLine, RiPhoneLine,
  RiUploadCloudLine, RiCloseLine, RiFileTextLine, RiShieldLine,
  RiCalendarLine, RiUser3Line, RiMapPinLine, RiFileChartLine,
  RiKeyLine, RiDeleteBinLine, RiLockLine, RiEyeLine, RiEyeOffLine, RiAlertLine,
} from 'react-icons/ri';

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 11 }, (_, i) => CURRENT_YEAR - i);
const FY_YEARS = Array.from({ length: 11 }, (_, i) => {
  const y = CURRENT_YEAR - i;
  return { value: `${y}-${y + 1}`, label: `FY ${y}–${String(y + 1).slice(2)}` };
});

const CATEGORY_OPTIONS = [
  { value: 'client_document', label: 'Client Document', staffOnly: true },
  { value: 'gst_return', label: 'GST Return', caOnly: true },
  { value: 'itr', label: 'ITR', caOnly: true },
  { value: 'other_return', label: 'Other Return', caOnly: true },
];

const DOC_TYPE_MAP = {
  client_document: ['bank_statement','invoice','purchase_bill','ledger','balance_sheet','profit_loss','tds_certificate','misc_client'],
  gst_return: ['GSTR-1','GSTR-3B','GSTR-9','GSTR-9C','GSTR-2A','GSTR-2B'],
  itr: ['ITR-1','ITR-2','ITR-3','ITR-4','ITR-5','ITR-6','form_16','form_26AS','tax_audit'],
  other_return: ['other'],
};

const emptyUpload = { category: '', documentType: '', description: '', year: '', month: '', quarter: '', financialYear: '' };

const TABS = [
  { key: 'all', label: 'All' },
  { key: 'client', label: 'Client docs' },
  { key: 'returns', label: 'Returns' },
];

export default function ClientDetail() {
  const { id } = useParams();
  const { isCA } = useAuth();
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [showReturn, setShowReturn] = useState(false);
  const [uploadForm, setUploadForm] = useState(emptyUpload);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [yearFilter, setYearFilter] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [clientLogin, setClientLogin] = useState(null);
  const [loginLoading, setLoginLoading] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [savingLogin, setSavingLogin] = useState(false);
  const loginInFlight = useRef(false);
  const [showDeleteClient, setShowDeleteClient] = useState(false);
  const [deletingClient, setDeletingClient] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get(`/clients/${id}`),
      api.get(`/documents/client/${id}`),
      isCA ? api.get(`/users/client-login/${id}`).catch(() => ({ data: { user: null } })) : Promise.resolve({ data: { user: null } }),
    ])
      .then(([cr, dr, lr]) => {
        setClient(cr.data.client);
        setDocuments(dr.data.documents || []);
        setClientLogin(lr.data.user || null);
      })
      .catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false));
  }, [id, isCA]);

  const handleCreateLogin = async (e) => {
    e.preventDefault();
    if (loginInFlight.current) return;
    if (!loginForm.email || !loginForm.password) return toast.error('Email and password required');
    if (loginForm.password.length < 6) return toast.error('Password must be at least 6 characters');
    loginInFlight.current = true;
    setSavingLogin(true);
    try {
      const { data } = await api.post(`/users/client-login/${id}`, loginForm);
      setClientLogin(data.user);
      setShowLoginModal(false);
      setLoginForm({ email: '', password: '' });
      toast.success('Client login created');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { loginInFlight.current = false; setSavingLogin(false); }
  };

  const handlePermanentDeleteClient = async () => {
    setDeletingClient(true);
    try {
      await api.delete(`/clients/${id}/permanent`);
      toast.success('Client removed permanently');
      navigate('/clients');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove client');
      setDeletingClient(false);
    }
  };

  const handleDeleteLogin = async () => {
    if (!confirm('Remove portal access for this client?')) return;
    setLoginLoading(true);
    try {
      await api.delete(`/users/client-login/${id}`);
      setClientLogin(null);
      toast.success('Access removed');
    } catch { toast.error('Failed to remove'); }
    finally { setLoginLoading(false); }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: files => setFile(files[0]),
    multiple: false,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'image/*': ['.jpg','.jpeg','.png'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
  });

  const availableCategories = CATEGORY_OPTIONS.filter(c => {
    if (c.caOnly && !isCA) return false;
    if (c.staffOnly && isCA) return false;
    return true;
  });

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return toast.error('Select a file');
    if (!uploadForm.category) return toast.error('Select category');
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file); fd.append('clientId', id);
      Object.entries(uploadForm).forEach(([k, v]) => { if (v) fd.append(k, v); });
      const { data } = await api.post('/documents/upload', fd);
      setDocuments(prev => [data.document, ...prev]);
      setShowUpload(false); setFile(null); setUploadForm(emptyUpload);
      toast.success('Uploaded!');
    } catch (err) { toast.error(err.response?.data?.message || 'Upload failed'); }
    finally { setUploading(false); }
  };

  const filteredDocs = documents.filter(d => {
    if (activeTab === 'client' && d.category !== 'client_document') return false;
    if (activeTab === 'returns' && d.category === 'client_document') return false;
    if (yearFilter && d.period?.year !== parseInt(yearFilter) && d.period?.financialYear !== yearFilter) return false;
    return true;
  });

  const groupedByYear = filteredDocs.reduce((acc, doc) => {
    const yr = doc.period?.financialYear || doc.period?.year || 'Undated';
    if (!acc[yr]) acc[yr] = [];
    acc[yr].push(doc);
    return acc;
  }, {});

  if (loading) return (
    <Layout>
      <div className="max-w-5xl mx-auto space-y-4">
        {[...Array(3)].map((_, i) => <div key={i} className="h-24 shimmer rounded-xl" />)}
      </div>
    </Layout>
  );

  if (!client) return <Layout><p className="text-gray-400 text-center py-20">Client not found</p></Layout>;

  const docCounts = {
    all: documents.length,
    client: documents.filter(d => d.category === 'client_document').length,
    returns: documents.filter(d => d.category !== 'client_document').length,
  };

  return (
    <Layout>
      <div className="max-w-5xl mx-auto space-y-8">

        
        <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}>
          <Link to="/clients" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition-colors mb-6 font-medium">
            <RiArrowLeftLine /> Clients
          </Link>

          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              <div className="avatar w-14 h-14 text-xl flex-shrink-0">{client.name.charAt(0)}</div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{client.name}</h1>
                <p className="text-sm text-gray-400 mt-0.5 capitalize">{client.businessType?.replace('_', ' ')}</p>
                
                <div className="flex flex-wrap gap-4 mt-2">
                  {client.gstin && (
                    <span className="flex items-center gap-1.5 text-xs text-gray-500">
                      <RiShieldLine className="text-gray-400" />
                      <span className="font-mono">{client.gstin}</span>
                    </span>
                  )}
                  {client.email && (
                    <span className="flex items-center gap-1.5 text-xs text-gray-500">
                      <RiMailLine className="text-gray-400" /> {client.email}
                    </span>
                  )}
                  {client.phone && (
                    <span className="flex items-center gap-1.5 text-xs text-gray-500">
                      <RiPhoneLine className="text-gray-400" /> {client.phone}
                    </span>
                  )}
                  {client.address?.city && (
                    <span className="flex items-center gap-1.5 text-xs text-gray-500">
                      <RiMapPinLine className="text-gray-400" /> {client.address.city}, {client.address.state}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-2 flex-shrink-0 flex-wrap">
              {isCA && (
                <button onClick={() => { setUploadForm({ ...emptyUpload, category: 'gst_return' }); setShowReturn(true); }} className="btn-accent">
                  <RiFileChartLine /> File Return
                </button>
              )}
              <button onClick={() => setShowUpload(true)} className="btn-primary">
                <RiUploadCloudLine /> Upload
              </button>
              {isCA && (
                <button
                  onClick={() => setShowDeleteClient(true)}
                  className="flex items-center gap-1.5 text-sm px-3 py-2 rounded-xl border border-red-200 text-red-500 hover:bg-red-50 transition-colors font-medium"
                >
                  <RiDeleteBinLine /> Remove
                </button>
              )}
            </div>
          </div>

          {client.assignedStaff?.length > 0 && (
            <div className="mt-4 flex items-center gap-2 flex-wrap">
              <span className="text-xs text-gray-400">Staff:</span>
              {client.assignedStaff.map(s => <span key={s._id} className="badge badge-blue">{s.name}</span>)}
            </div>
          )}

          
          {isCA && (
            <div className={`mt-4 inline-flex items-center gap-3 px-4 py-2.5 rounded-xl border text-sm ${
              clientLogin ? 'border-green-100 bg-green-50' : 'border-gray-100 bg-gray-50'
            }`}>
              <RiKeyLine className={clientLogin ? 'text-green-600' : 'text-gray-400'} />
              {clientLogin ? (
                <>
                  <span className="text-green-800 font-medium">Portal access:</span>
                  <span className="text-green-700">{clientLogin.email}</span>
                  <button onClick={handleDeleteLogin} disabled={loginLoading}
                    className="ml-2 p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors" title="Remove access">
                    <RiDeleteBinLine className="text-sm" />
                  </button>
                </>
              ) : (
                <>
                  <span className="text-gray-500">No portal access</span>
                  <button onClick={() => setShowLoginModal(true)}
                    className="ml-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors">
                    + Create login
                  </button>
                </>
              )}
            </div>
          )}
        </motion.div>

        
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-0.5 border-b border-gray-100 w-full pb-0">
            {TABS.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`relative px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === tab.key ? 'text-gray-900' : 'text-gray-400 hover:text-gray-700'
                }`}
              >
                {tab.label}
                <span className="ml-1.5 text-xs text-gray-400">({docCounts[tab.key]})</span>
                {activeTab === tab.key && (
                  <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900 rounded-full" />
                )}
              </button>
            ))}
            <div className="ml-auto pb-1">
              <select
                value={yearFilter}
                onChange={e => setYearFilter(e.target.value)}
                className="input-field py-1.5 text-xs"
                style={{ width: 140 }}
              >
                <option value="">All years</option>
                {FY_YEARS.map(y => <option key={y.value} value={y.value}>{y.label}</option>)}
                {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>
        </motion.div>

        
        {filteredDocs.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-20 flex flex-col items-center text-gray-400">
            <RiFileTextLine className="text-4xl mb-3" />
            <p className="text-sm font-medium text-gray-500">No documents found</p>
            <button onClick={() => setShowUpload(true)} className="mt-4 text-indigo-600 text-sm hover:underline">Upload one now</button>
          </motion.div>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedByYear)
              .sort(([a], [b]) => String(b).localeCompare(String(a)))
              .map(([year, docs]) => (
                <motion.div key={year} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                  <div className="flex items-center gap-3 mb-3">
                    <RiCalendarLine className="text-gray-400 text-sm flex-shrink-0" />
                    <span className="section-label">{year}</span>
                    <div className="flex-1 h-px bg-gray-100" />
                    <span className="text-xs text-gray-400">{docs.length} file{docs.length !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="space-y-2">
                    {docs.map((doc, i) => (
                      <FileCard key={doc._id} doc={doc} delay={i * 0.04}
                        onDelete={id => setDocuments(prev => prev.filter(d => d._id !== id))} />
                    ))}
                  </div>
                </motion.div>
              ))}
          </div>
        )}
      </div>

      
      <AnimatePresence>
        {showLoginModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)' }}
            onClick={e => e.target === e.currentTarget && setShowLoginModal(false)}>
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 12 }} animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0 }} transition={{ duration: 0.18 }}
              className="bg-white rounded-2xl w-full max-w-sm shadow-2xl border border-gray-100">
              <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Create portal login</h2>
                  <p className="text-xs text-gray-400 mt-0.5">For {client?.name}</p>
                </div>
                <button onClick={() => setShowLoginModal(false)} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400">
                  <RiCloseLine className="text-lg" />
                </button>
              </div>
              <form onSubmit={handleCreateLogin} className="px-6 py-5 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Email address</label>
                  <div className="relative">
                    <RiUser3Line className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                    <input type="email" required value={loginForm.email}
                      onChange={e => setLoginForm({ ...loginForm, email: e.target.value })}
                      className="input-field pl-9" placeholder="client@email.com" autoFocus />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Password</label>
                  <div className="relative">
                    <RiLockLine className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                    <input type={showPass ? 'text' : 'password'} required value={loginForm.password}
                      onChange={e => setLoginForm({ ...loginForm, password: e.target.value })}
                      className="input-field pl-9 pr-10" placeholder="Min 6 characters" />
                    <button type="button" onClick={() => setShowPass(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showPass ? <RiEyeOffLine /> : <RiEyeLine />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Share these credentials with your client.</p>
                </div>
                <div className="flex gap-3 pt-2 border-t border-gray-100">
                  <button type="button" onClick={() => setShowLoginModal(false)} className="btn-secondary flex-1">Cancel</button>
                  <button type="submit" disabled={savingLogin} className="btn-primary flex-1 justify-center">
                    {savingLogin ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <><RiKeyLine /> Create</>}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      
      <AnimatePresence>
        {showReturn && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)' }}
            onClick={e => e.target === e.currentTarget && (setShowReturn(false), setFile(null), setUploadForm(emptyUpload))}
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
                  <h2 className="text-lg font-semibold text-gray-900">File a Return</h2>
                  <p className="text-xs text-gray-400 mt-0.5">Upload ITR / GST / Other return for {client?.name}</p>
                </div>
                <button onClick={() => { setShowReturn(false); setFile(null); setUploadForm(emptyUpload); }}
                  className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-400">
                  <RiCloseLine className="text-lg" />
                </button>
              </div>
              <form onSubmit={async (e) => {
                e.preventDefault();
                if (!file) return toast.error('Select a file');
                setUploading(true);
                try {
                  const fd = new FormData();
                  fd.append('file', file); fd.append('clientId', id);
                  Object.entries(uploadForm).forEach(([k, v]) => { if (v) fd.append(k, v); });
                  const { data } = await api.post('/documents/upload', fd);
                  setDocuments(prev => [data.document, ...prev]);
                  setShowReturn(false); setFile(null); setUploadForm(emptyUpload);
                  toast.success('Return filed!');
                } catch (err) { toast.error(err.response?.data?.message || 'Upload failed'); }
                finally { setUploading(false); }
              }} className="px-6 py-5 space-y-4">

                
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-2">Return type *</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: 'gst_return', label: 'GST Return', color: 'text-green-600 border-green-200 bg-green-50' },
                      { value: 'itr',        label: 'ITR',        color: 'text-purple-600 border-purple-200 bg-purple-50' },
                      { value: 'other_return', label: 'Other',   color: 'text-amber-600 border-amber-200 bg-amber-50' },
                    ].map(rt => (
                      <button key={rt.value} type="button"
                        onClick={() => setUploadForm({ ...uploadForm, category: rt.value, documentType: '' })}
                        className={`px-3 py-2.5 rounded-lg border-2 text-sm font-semibold transition-all text-center ${
                          uploadForm.category === rt.value ? rt.color + ' border-current' : 'border-gray-100 text-gray-500 hover:border-gray-200'
                        }`}>
                        {rt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Document type</label>
                  <select value={uploadForm.documentType}
                    onChange={e => setUploadForm({ ...uploadForm, documentType: e.target.value })}
                    className="input-field">
                    <option value="">Select type…</option>
                    {(DOC_TYPE_MAP[uploadForm.category] || []).map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5">Financial year *</label>
                    <select required value={uploadForm.financialYear}
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
                      <option value="">Select…</option>
                      {['Q1 (Apr–Jun)','Q2 (Jul–Sep)','Q3 (Oct–Dec)','Q4 (Jan–Mar)'].map((q, i) => (
                        <option key={i} value={`Q${i+1}`}>{q}</option>
                      ))}
                    </select>
                  </div>
                </div>

                
                <div {...getRootProps()} className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                  isDragActive ? 'border-indigo-400 bg-indigo-50' :
                  file ? 'border-green-400 bg-green-50' :
                  'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}>
                  <input {...getInputProps()} />
                  {file ? (
                    <>
                      <RiFileTextLine className="text-2xl text-green-600 mx-auto mb-1.5" />
                      <p className="text-sm font-medium text-gray-800">{file.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{(file.size / 1024).toFixed(1)} KB</p>
                    </>
                  ) : (
                    <>
                      <RiUploadCloudLine className="text-3xl text-gray-300 mx-auto mb-1.5" />
                      <p className="text-sm text-gray-500">{isDragActive ? 'Drop it here' : 'Drag & drop or click to browse'}</p>
                      <p className="text-xs text-gray-400 mt-1">PDF, Excel, Images — up to 50 MB</p>
                    </>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Notes (optional)</label>
                  <textarea rows={2} value={uploadForm.description}
                    onChange={e => setUploadForm({ ...uploadForm, description: e.target.value })}
                    className="input-field resize-none" placeholder="Any notes for this return…" />
                </div>

                <div className="flex gap-3 pt-2 border-t border-gray-100">
                  <button type="button" onClick={() => { setShowReturn(false); setFile(null); setUploadForm(emptyUpload); }} className="btn-secondary flex-1">Cancel</button>
                  <button type="submit" disabled={uploading || !file} className="btn-accent flex-1 justify-center">
                    {uploading ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <><RiFileChartLine /> File Return</>}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>


      <AnimatePresence>
        {showDeleteClient && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)' }}
            onClick={e => e.target === e.currentTarget && !deletingClient && setShowDeleteClient(false)}>
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 12 }} animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0 }} transition={{ duration: 0.18 }}
              className="bg-white rounded-2xl w-full max-w-sm shadow-2xl border border-gray-100">
              <div className="px-6 pt-6 pb-4 flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-4">
                  <RiAlertLine className="text-2xl text-red-500" />
                </div>
                <h2 className="text-base font-semibold text-gray-900">Remove client permanently?</h2>
                <p className="text-sm text-gray-500 mt-2">
                  <span className="font-medium text-gray-800">{client?.name}</span> and all their data will be deleted — including{' '}
                  <span className="font-medium text-gray-800">{documents.length} document{documents.length !== 1 ? 's' : ''}</span>, portal access, and staff assignments. This cannot be undone.
                </p>
              </div>
              <div className="flex gap-3 px-6 pb-6">
                <button
                  onClick={() => setShowDeleteClient(false)}
                  disabled={deletingClient}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePermanentDeleteClient}
                  disabled={deletingClient}
                  className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-colors"
                >
                  {deletingClient
                    ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    : <><RiDeleteBinLine /> Remove client</>
                  }
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>


      <AnimatePresence>
        {showUpload && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)' }}
            onClick={e => e.target === e.currentTarget && setShowUpload(false)}
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
                  <p className="text-xs text-gray-400 mt-0.5">For {client.name}</p>
                </div>
                <button onClick={() => { setShowUpload(false); setFile(null); setUploadForm(emptyUpload); }}
                  className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-400">
                  <RiCloseLine className="text-lg" />
                </button>
              </div>

              <form onSubmit={handleUpload} className="px-6 py-5 space-y-4">
                
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
                      <p className="text-xs text-gray-400 mt-1">{(file.size / 1024).toFixed(1)} KB</p>
                    </>
                  ) : (
                    <>
                      <RiUploadCloudLine className="text-3xl text-gray-300 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">{isDragActive ? 'Drop it here' : 'Drag & drop or click to browse'}</p>
                      <p className="text-xs text-gray-400 mt-1">PDF, Excel, Images, Word — up to 50 MB</p>
                    </>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Category *</label>
                  <select required value={uploadForm.category}
                    onChange={e => setUploadForm({ ...uploadForm, category: e.target.value, documentType: '' })}
                    className="input-field">
                    <option value="">Select category…</option>
                    {availableCategories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>

                {uploadForm.category && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5">Document type</label>
                    <select value={uploadForm.documentType}
                      onChange={e => setUploadForm({ ...uploadForm, documentType: e.target.value })}
                      className="input-field">
                      <option value="">Select type…</option>
                      {(DOC_TYPE_MAP[uploadForm.category] || []).map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
                    </select>
                  </div>
                )}

                {uploadForm.category && uploadForm.category !== 'client_document' && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1.5">Financial year</label>
                      <select value={uploadForm.financialYear} onChange={e => setUploadForm({ ...uploadForm, financialYear: e.target.value })} className="input-field">
                        <option value="">Select FY…</option>
                        {FY_YEARS.map(y => <option key={y.value} value={y.value}>{y.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1.5">Quarter</label>
                      <select value={uploadForm.quarter} onChange={e => setUploadForm({ ...uploadForm, quarter: e.target.value })} className="input-field">
                        <option value="">Select…</option>
                        {['Q1 (Apr–Jun)','Q2 (Jul–Sep)','Q3 (Oct–Dec)','Q4 (Jan–Mar)'].map((q, i) => <option key={i} value={`Q${i+1}`}>{q}</option>)}
                      </select>
                    </div>
                  </div>
                )}

                {uploadForm.category === 'client_document' && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5">Year (optional)</label>
                    <select value={uploadForm.year} onChange={e => setUploadForm({ ...uploadForm, year: e.target.value })} className="input-field">
                      <option value="">Select year…</option>
                      {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Description (optional)</label>
                  <textarea rows={2} value={uploadForm.description}
                    onChange={e => setUploadForm({ ...uploadForm, description: e.target.value })}
                    className="input-field resize-none" placeholder="Brief description…" />
                </div>

                <div className="flex gap-3 pt-2 border-t border-gray-100">
                  <button type="button" onClick={() => { setShowUpload(false); setFile(null); setUploadForm(emptyUpload); }} className="btn-secondary flex-1">Cancel</button>
                  <button type="submit" disabled={uploading || !file} className="btn-primary flex-1 justify-center">
                    {uploading ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <><RiUploadCloudLine /> Upload</>}
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
