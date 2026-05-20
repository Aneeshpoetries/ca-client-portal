import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Layout from '../components/Layout';
import api from '../api/axios';
import {
  RiArrowRightLine, RiFilePdfLine, RiFileExcelLine, RiFileImageLine,
  RiFileTextLine, RiAddLine, RiMegaphoneLine, RiAlertLine, RiUploadCloudLine,
  RiBuilding2Line, RiTeamLine, RiCalendarLine,
  RiFolder3Line, RiFolderUploadLine, RiFileChartLine,
} from 'react-icons/ri';

const VARIANTS = {
  page: { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } },
  item: { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } } },
  card: { hidden: { opacity: 0, scale: 0.97 }, show: { opacity: 1, scale: 1, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } } },
};

function timeAgo(d) {
  const diff = Date.now() - new Date(d);
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

const GRADIENTS = [
  ['#6366f1','#8b5cf6'],['#ec4899','#f43f5e'],['#10b981','#059669'],
  ['#f59e0b','#d97706'],['#06b6d4','#3b82f6'],['#8b5cf6','#6366f1'],
];

function mimeIcon(mime, isDark) {
  const op = (hex, a) => hex + Math.round(a*255).toString(16).padStart(2,'0');
  if (mime === 'application/pdf')
    return { Icon: RiFilePdfLine,   color: isDark ? '#f87171' : '#dc2626', bg: isDark ? op('#dc2626',0.14) : '#fff1f2' };
  if (mime?.includes('excel') || mime?.includes('sheet'))
    return { Icon: RiFileExcelLine, color: isDark ? '#4ade80' : '#16a34a', bg: isDark ? op('#16a34a',0.14) : '#f0fdf4' };
  if (mime?.includes('image'))
    return { Icon: RiFileImageLine, color: isDark ? '#60a5fa' : '#2563eb', bg: isDark ? op('#2563eb',0.14) : '#eff6ff' };
  return   { Icon: RiFileTextLine,  color: isDark ? '#c084fc' : '#7c3aed', bg: isDark ? op('#7c3aed',0.14) : '#faf5ff' };
}

function useP() {
  const { isDark } = useTheme();
  return {
    isDark,
    t1:     isDark ? '#ece9e4' : '#1a1f1e',
    t2:     isDark ? '#b0c0b8' : '#3d4a44',
    t3:     isDark ? '#6a8880' : '#7a8880',
    muted:  isDark ? '#3d5448' : '#c8d0dc',
    border: isDark ? '#2c3c34' : '#f1f5f9',
    hover:  isDark ? '#1a2420' : '#f8fafc',
    emptyBg:isDark ? '#1a2420' : '#f4f6fa',
    brand:  isDark ? '#20b89a' : '#0e5c4f',
    brandHover: isDark ? '#18a088' : '#0a4a3e',
    annBg:  isDark ? '#182820' : '#d6ede8',
    annIcon:isDark ? '#20b89a' : '#0e5c4f',
    alertBg:isDark ? 'rgba(220,38,38,0.12)' : '#fff1f2',
  };
}

function StatCard({ label, value, icon: Icon, accentClass, iconBg, iconColor, loading, P }) {
  return (
    <motion.div variants={VARIANTS.card} className={`stat-card ${accentClass}`}>
      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: iconBg }}>
        <Icon className="text-base" style={{ color: iconColor }} />
      </div>
      <p className="num text-2xl font-extrabold tracking-[-0.04em] leading-none" style={{ color: P.t1 }}>
        {loading ? <span className="inline-block w-10 h-6 shimmer rounded" /> : value}
      </p>
      <p className="text-xs font-medium" style={{ color: P.t3 }}>{label}</p>
    </motion.div>
  );
}

function ClientCard({ client, index, P }) {
  const [a, b] = GRADIENTS[index % GRADIENTS.length];
  return (
    <motion.div variants={VARIANTS.card} whileHover={{ y: -3 }}>
      <Link to={`/clients/${client._id}`} className="card-link p-5 group" style={{ textDecoration: 'none' }}>
        <div className="flex items-start gap-3.5 mb-4">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm"
            style={{ background: `linear-gradient(135deg, ${a}, ${b})` }}>
            <span className="text-white text-base font-bold">{client.name.charAt(0).toUpperCase()}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold truncate leading-snug transition-colors" style={{ color: P.t1 }}>
              {client.name}
            </p>
            <p className="text-[11px] mt-0.5 capitalize font-medium" style={{ color: P.t3 }}>
              {client.businessType?.replace(/_/g, ' ') || 'Business'}
            </p>
          </div>
          <RiArrowRightLine className="flex-shrink-0 mt-0.5 transition-colors" style={{ color: P.muted }} />
        </div>
        <div className="flex items-center justify-between pt-3" style={{ borderTop: `1px solid ${P.border}` }}>
          <div className="flex items-center gap-1.5">
            <RiFolder3Line className="text-xs" style={{ color: P.muted }} />
            <span className="text-xs font-medium" style={{ color: P.t3 }}>{client.documentCount || 0} files</span>
          </div>
          <span className="text-[10px] font-mono truncate max-w-[100px]" style={{ color: P.muted }}>
            {client.gstin || 'No GSTIN'}
          </span>
        </div>
      </Link>
    </motion.div>
  );
}

function StaffCard({ member, index, P }) {
  const [a, b] = GRADIENTS[(index + 3) % GRADIENTS.length];
  return (
    <motion.div variants={VARIANTS.card} whileHover={{ y: -2 }} className="card card-hover flex items-center gap-3.5 p-4">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm"
        style={{ background: `linear-gradient(135deg, ${a}, ${b})` }}>
        <span className="text-white text-sm font-bold">{member.name.charAt(0).toUpperCase()}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate" style={{ color: P.t1 }}>{member.name}</p>
        <p className="text-xs truncate mt-0.5" style={{ color: P.t3 }}>{member.email}</p>
      </div>
      <span className="text-[10px] font-bold px-2 py-1 rounded-full tracking-wide flex-shrink-0"
        style={member.isActive
          ? { background: P.isDark ? 'rgba(16,185,129,0.15)' : '#ecfdf5', color: P.isDark ? '#4ade80' : '#059669' }
          : { background: P.isDark ? 'rgba(107,114,128,0.15)' : '#f3f4f6', color: P.isDark ? '#6b7280' : '#9ca3af' }
        }>
        {member.isActive ? 'Active' : 'Inactive'}
      </span>
    </motion.div>
  );
}

export default function Dashboard() {
  const { user, isCA } = useAuth();
  const P = useP();

  const [stats, setStats]               = useState({ clients: 0, totalDocs: 0, clientDocs: 0, caReturns: 0 });
  const [recentDocs, setRecentDocs]     = useState([]);
  const [clients, setClients]           = useState([]);
  const [staff, setStaff]               = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading]           = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [annRes, clientRes] = await Promise.all([api.get('/announcements'), api.get('/clients')]);
        setAnnouncements((annRes.data.announcements || []).slice(0, 3));
        const clientList = clientRes.data.clients || [];
        setClients(clientList.slice(0, 6));
        if (isCA) { const r = await api.get('/users'); setStaff(r.data.users || []); }

        let totalDocs = 0, clientDocs = 0, caReturns = 0;
        const allDocs = [];
        for (const client of clientList.slice(0, 10)) {
          const docRes = await api.get(`/documents/client/${client._id}`);
          const docs = docRes.data.documents || [];
          totalDocs  += docs.length;
          clientDocs += docs.filter(d => d.category === 'client_document').length;
          caReturns  += docs.filter(d => d.category !== 'client_document').length;
          allDocs.push(...docs.map(d => ({ ...d, _clientName: client.name })));
        }
        allDocs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setRecentDocs(allDocs.slice(0, 6));
        setStats({ clients: clientList.length, totalDocs, clientDocs, caReturns });
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetchData();
  }, [isCA]);

  const now     = new Date();
  const fyStart = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
  const greeting = now.getHours() < 12 ? 'Good morning' : now.getHours() < 17 ? 'Good afternoon' : 'Good evening';

  const IB = P.isDark
    ? { indigo: 'rgba(99,102,241,0.18)',  purple: 'rgba(139,92,246,0.18)', pink: 'rgba(236,72,153,0.18)',  emerald: 'rgba(16,185,129,0.18)' }
    : { indigo: '#eef2ff',                purple: '#faf5ff',               pink: '#fdf2f8',                emerald: '#ecfdf5' };

  const statCards = isCA
    ? [
        { label: 'Total Clients',   value: stats.clients,    icon: RiTeamLine,         accentClass: 'accent-indigo',  iconBg: IB.indigo,  iconColor: P.isDark ? '#818cf8' : '#6366f1' },
        { label: 'Total Documents', value: stats.totalDocs,  icon: RiFolder3Line,      accentClass: 'accent-purple',  iconBg: IB.purple,  iconColor: P.isDark ? '#a78bfa' : '#8b5cf6' },
        { label: 'Client Uploads',  value: stats.clientDocs, icon: RiFolderUploadLine, accentClass: 'accent-pink',    iconBg: IB.pink,    iconColor: P.isDark ? '#f472b6' : '#ec4899' },
        { label: 'Returns Filed',   value: stats.caReturns,  icon: RiFileChartLine,    accentClass: 'accent-emerald', iconBg: IB.emerald, iconColor: P.isDark ? '#34d399' : '#10b981' },
      ]
    : [
        { label: 'My Clients',   value: stats.clients,    icon: RiTeamLine,         accentClass: 'accent-indigo',  iconBg: IB.indigo,  iconColor: P.isDark ? '#818cf8' : '#6366f1' },
        { label: 'My Uploads',   value: stats.clientDocs, icon: RiFolderUploadLine, accentClass: 'accent-purple',  iconBg: IB.purple,  iconColor: P.isDark ? '#a78bfa' : '#8b5cf6' },
        { label: 'CA Returns',   value: stats.caReturns,  icon: RiFileChartLine,    accentClass: 'accent-pink',    iconBg: IB.pink,    iconColor: P.isDark ? '#f472b6' : '#ec4899' },
        { label: 'Total Docs',   value: stats.totalDocs,  icon: RiFolder3Line,      accentClass: 'accent-emerald', iconBg: IB.emerald, iconColor: P.isDark ? '#34d399' : '#10b981' },
      ];

  return (
    <Layout>
      <motion.section className="max-w-5xl mx-auto space-y-9" variants={VARIANTS.page} initial="hidden" animate="show">

        
        <motion.div variants={VARIANTS.item}>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <p className="section-label flex items-center gap-1.5 mb-2">
                <RiCalendarLine />
                {now.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
              <h1 className="font-extrabold" style={{ fontSize: 28, letterSpacing: '-0.03em', lineHeight: 1.2, color: P.t1 }}>
                {greeting}, {user?.name?.split(' ')[0]}.
              </h1>
              <p className="text-sm mt-1 font-medium" style={{ color: P.t3 }}>
                Financial Year {fyStart}–{String(fyStart + 1).slice(2)}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {isCA && <Link to="/clients" className="btn"><RiAddLine /> Add Client</Link>}
              <Link to="/documents" className="btn"><RiUploadCloudLine /> Upload</Link>
              <Link to="/clients" className="btn-secondary">All Clients <RiArrowRightLine /></Link>
            </div>
          </div>

          <motion.div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-7" variants={VARIANTS.page}>
            {statCards.map(sc => <StatCard key={sc.label} {...sc} loading={loading} P={P} />)}
          </motion.div>
        </motion.div>

        
        {announcements.length > 0 && (
          <motion.div variants={VARIANTS.item}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[15px] font-bold tracking-tight" style={{ color: P.t1 }}>Latest Updates</h2>
              <Link to="/announcements" className="text-xs font-semibold flex items-center gap-1 transition-colors"
                style={{ color: P.brand }}
                onMouseEnter={e => e.currentTarget.style.color = P.brandHover}
                onMouseLeave={e => e.currentTarget.style.color = P.brand}
              >
                View all <RiArrowRightLine />
              </Link>
            </div>
            <div className="space-y-2">
              {announcements.map((ann) => (
                <div key={ann._id}
                  className={`card flex items-start gap-3.5 px-5 py-4 ${ann.isImportant ? 'border-l-[3px] border-l-red-400' : ''}`}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: ann.isImportant ? P.alertBg : P.annBg }}>
                    {ann.isImportant
                      ? <RiAlertLine className="text-sm" style={{ color: P.isDark ? '#f87171' : '#dc2626' }} />
                      : <RiMegaphoneLine className="text-sm" style={{ color: P.annIcon }} />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold leading-snug" style={{ color: P.t1 }}>{ann.title}</p>
                    <p className="text-xs mt-0.5 line-clamp-1" style={{ color: P.t3 }}>{ann.content}</p>
                  </div>
                  <span className="text-[11px] font-medium flex-shrink-0 mt-0.5 whitespace-nowrap" style={{ color: P.t3 }}>
                    {new Date(ann.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        
        <motion.div variants={VARIANTS.item}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[15px] font-bold tracking-tight flex items-center gap-2" style={{ color: P.t1 }}>
              <RiBuilding2Line style={{ color: P.t3 }} />
              {isCA ? 'Your Clients' : 'Assigned Clients'}
            </h2>
            <Link to="/clients" className="text-xs font-semibold flex items-center gap-1 transition-colors"
              style={{ color: P.brand }}
              onMouseEnter={e => e.currentTarget.style.color = P.brandHover}
              onMouseLeave={e => e.currentTarget.style.color = P.brand}
            >
              View all <RiArrowRightLine />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => <div key={i} className="h-[110px] shimmer rounded-[14px]" />)}
            </div>
          ) : clients.length === 0 ? (
            <div className="card py-20 flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-2" style={{ background: P.emptyBg }}>
                <RiBuilding2Line className="text-xl" style={{ color: P.muted }} />
              </div>
              <p className="text-sm font-semibold" style={{ color: P.t3 }}>No clients yet</p>
              {isCA && (
                <Link to="/clients" className="text-xs font-medium transition-colors" style={{ color: P.brand }}>
                  Add your first client →
                </Link>
              )}
            </div>
          ) : (
            <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" variants={VARIANTS.page}>
              {clients.map((client, i) => <ClientCard key={client._id} client={client} index={i} P={P} />)}
            </motion.div>
          )}
        </motion.div>

        
        {isCA && staff.length > 0 && (
          <motion.div variants={VARIANTS.item}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[15px] font-bold tracking-tight flex items-center gap-2" style={{ color: P.t1 }}>
                <RiTeamLine style={{ color: P.t3 }} /> Your Team
              </h2>
              <Link to="/users" className="text-xs font-semibold flex items-center gap-1 transition-colors"
                style={{ color: P.brand }}
                onMouseEnter={e => e.currentTarget.style.color = P.brandHover}
                onMouseLeave={e => e.currentTarget.style.color = P.brand}
              >
                Manage <RiArrowRightLine />
              </Link>
            </div>
            <motion.div className="grid grid-cols-1 sm:grid-cols-2 gap-3" variants={VARIANTS.page}>
              {staff.map((m, i) => <StaffCard key={m._id} member={m} index={i} P={P} />)}
            </motion.div>
          </motion.div>
        )}

        
        <motion.div variants={VARIANTS.item}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[15px] font-bold tracking-tight" style={{ color: P.t1 }}>Recent Documents</h2>
            <Link to="/documents" className="text-xs font-semibold flex items-center gap-1 transition-colors"
              style={{ color: P.brand }}
              onMouseEnter={e => e.currentTarget.style.color = P.brandHover}
              onMouseLeave={e => e.currentTarget.style.color = P.brand}
            >
              View all <RiArrowRightLine />
            </Link>
          </div>

          <div className="card overflow-hidden" style={{ padding: 0 }}>
            {loading ? (
              [...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-4 px-5 py-3.5 last:border-0"
                  style={{ borderBottom: `1px solid ${P.border}` }}>
                  <div className="w-9 h-9 shimmer rounded-lg flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3.5 shimmer rounded w-2/3" />
                    <div className="h-3 shimmer rounded w-1/3" />
                  </div>
                  <div className="h-3 w-10 shimmer rounded" />
                </div>
              ))
            ) : recentDocs.length === 0 ? (
              <div className="py-16 flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-1" style={{ background: P.emptyBg }}>
                  <RiFileTextLine className="text-xl" style={{ color: P.muted }} />
                </div>
                <p className="text-sm font-semibold" style={{ color: P.t3 }}>No documents yet</p>
              </div>
            ) : (
              recentDocs.map((doc) => {
                const { Icon: DocIcon, color, bg } = mimeIcon(doc.mimeType, P.isDark);
                return (
                  <div key={doc._id}
                    className="flex items-center gap-4 px-5 py-3.5 transition-colors last:border-0"
                    style={{ borderBottom: `1px solid ${P.border}` }}
                    onMouseEnter={e => e.currentTarget.style.background = P.hover}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: bg }}>
                      <DocIcon style={{ color }} className="text-base" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate" style={{ color: P.t1 }}>{doc.originalName}</p>
                      <p className="text-xs mt-0.5 truncate" style={{ color: P.t3 }}>
                        {doc._clientName} · {doc.uploadedBy?.name}
                      </p>
                    </div>
                    <span className="text-[11px] font-medium flex-shrink-0" style={{ color: P.t3 }}>
                      {timeAgo(doc.createdAt)}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </motion.div>

      </motion.section>
    </Layout>
  );
}
