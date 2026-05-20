import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import api from '../api/axios';
import {
  RiArrowRightLine, RiFilePdfLine, RiFileExcelLine, RiFileImageLine,
  RiFileTextLine, RiAddLine, RiMegaphoneLine, RiAlertLine, RiUploadCloudLine,
  RiBuilding2Line, RiTeamLine, RiCalendarLine,
  RiFolder3Line, RiFolderUploadLine, RiFileChartLine,
} from 'react-icons/ri';

// ── Animation variants ────────────────────────────────────────────────────────
const VARIANTS = {
  page: {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.06 } },
  },
  item: {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
  },
  card: {
    hidden: { opacity: 0, scale: 0.97 },
    show: { opacity: 1, scale: 1, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
  },
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function timeAgo(d) {
  const diff = Date.now() - new Date(d);
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

function mimeIcon(mime) {
  if (mime === 'application/pdf')
    return { icon: RiFilePdfLine, color: '#dc2626', bg: '#fff1f2' };
  if (mime?.includes('excel') || mime?.includes('sheet'))
    return { icon: RiFileExcelLine, color: '#16a34a', bg: '#f0fdf4' };
  if (mime?.includes('image'))
    return { icon: RiFileImageLine, color: '#2563eb', bg: '#eff6ff' };
  return { icon: RiFileTextLine, color: '#7c3aed', bg: '#faf5ff' };
}

const GRADIENTS = [
  ['#6366f1', '#8b5cf6'], ['#ec4899', '#f43f5e'], ['#10b981', '#059669'],
  ['#f59e0b', '#d97706'], ['#06b6d4', '#3b82f6'], ['#8b5cf6', '#6366f1'],
];

// ── StatCard ──────────────────────────────────────────────────────────────────
function StatCard({ label, value, icon: Icon, accentClass, iconBg, iconColor, loading }) {
  return (
    <motion.div variants={VARIANTS.card} className={`stat-card ${accentClass}`}>
      {/* Icon */}
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: iconBg }}
      >
        <Icon className="text-base" style={{ color: iconColor }} />
      </div>

      {/* Value */}
      <p className="num text-2xl font-extrabold text-[#0d1117] tracking-[-0.04em] leading-none">
        {loading ? <span className="inline-block w-10 h-6 shimmer rounded" /> : value}
      </p>

      {/* Label */}
      <p className="text-xs font-medium text-[#8896a4]">{label}</p>
    </motion.div>
  );
}

// ── ClientCard ────────────────────────────────────────────────────────────────
function ClientCard({ client, index }) {
  const [a, b] = GRADIENTS[index % GRADIENTS.length];
  return (
    <motion.div variants={VARIANTS.card} whileHover={{ y: -3 }}>
      <Link
        to={`/clients/${client._id}`}
        className="card-link p-5 group"
        style={{ textDecoration: 'none' }}
      >
        {/* Header */}
        <div className="flex items-start gap-3.5 mb-4">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm"
            style={{ background: `linear-gradient(135deg, ${a}, ${b})` }}
          >
            <span className="text-white text-base font-bold">
              {client.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-[#0d1117] group-hover:text-indigo-600 transition-colors truncate leading-snug">
              {client.name}
            </p>
            <p className="text-[11px] text-[#8896a4] mt-0.5 capitalize font-medium">
              {client.businessType?.replace(/_/g, ' ') || 'Business'}
            </p>
          </div>
          <RiArrowRightLine className="text-[#c8d0dc] group-hover:text-indigo-400 transition-colors flex-shrink-0 mt-0.5" />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-[#f1f5f9]">
          <div className="flex items-center gap-1.5">
            <RiFolder3Line className="text-[#c8d0dc] text-xs" />
            <span className="text-xs text-[#8896a4] font-medium">
              {client.documentCount || 0} files
            </span>
          </div>
          {client.gstin ? (
            <span className="text-[10px] font-mono text-[#c8d0dc] truncate max-w-[100px]">
              {client.gstin}
            </span>
          ) : (
            <span className="text-[10px] text-[#c8d0dc]">No GSTIN</span>
          )}
        </div>
      </Link>
    </motion.div>
  );
}

// ── StaffCard ─────────────────────────────────────────────────────────────────
function StaffCard({ member, index }) {
  const [a, b] = GRADIENTS[(index + 3) % GRADIENTS.length];
  return (
    <motion.div
      variants={VARIANTS.card}
      whileHover={{ y: -2 }}
      className="card card-hover flex items-center gap-3.5 p-4"
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm"
        style={{ background: `linear-gradient(135deg, ${a}, ${b})` }}
      >
        <span className="text-white text-sm font-bold">
          {member.name.charAt(0).toUpperCase()}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[#0d1117] truncate">{member.name}</p>
        <p className="text-xs text-[#8896a4] truncate mt-0.5">{member.email}</p>
      </div>
      <span
        className={`text-[10px] font-bold px-2 py-1 rounded-full tracking-wide flex-shrink-0 ${
          member.isActive
            ? 'bg-emerald-50 text-emerald-600'
            : 'bg-gray-100 text-gray-400'
        }`}
      >
        {member.isActive ? 'Active' : 'Inactive'}
      </span>
    </motion.div>
  );
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const { user, isCA } = useAuth();
  const [stats, setStats]           = useState({ clients: 0, totalDocs: 0, clientDocs: 0, caReturns: 0 });
  const [recentDocs, setRecentDocs] = useState([]);
  const [clients, setClients]       = useState([]);
  const [staff, setStaff]           = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [annRes, clientRes] = await Promise.all([
          api.get('/announcements'),
          api.get('/clients'),
        ]);
        setAnnouncements((annRes.data.announcements || []).slice(0, 3));
        const clientList = clientRes.data.clients || [];
        setClients(clientList.slice(0, 6));

        if (isCA) {
          const usersRes = await api.get('/users');
          setStaff(usersRes.data.users || []);
        }

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
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isCA]);

  const now     = new Date();
  const fyStart = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
  const greeting =
    now.getHours() < 12 ? 'Good morning'
    : now.getHours() < 17 ? 'Good afternoon'
    : 'Good evening';

  const statCards = isCA
    ? [
        { label: 'Total Clients',   value: stats.clients,    icon: RiTeamLine,         accentClass: 'accent-indigo',  iconBg: '#eef2ff', iconColor: '#6366f1' },
        { label: 'Total Documents', value: stats.totalDocs,  icon: RiFolder3Line,      accentClass: 'accent-purple',  iconBg: '#faf5ff', iconColor: '#8b5cf6' },
        { label: 'Client Uploads',  value: stats.clientDocs, icon: RiFolderUploadLine, accentClass: 'accent-pink',    iconBg: '#fdf2f8', iconColor: '#ec4899' },
        { label: 'Returns Filed',   value: stats.caReturns,  icon: RiFileChartLine,    accentClass: 'accent-emerald', iconBg: '#ecfdf5', iconColor: '#10b981' },
      ]
    : [
        { label: 'My Clients',   value: stats.clients,    icon: RiTeamLine,         accentClass: 'accent-indigo',  iconBg: '#eef2ff', iconColor: '#6366f1' },
        { label: 'My Uploads',   value: stats.clientDocs, icon: RiFolderUploadLine, accentClass: 'accent-purple',  iconBg: '#faf5ff', iconColor: '#8b5cf6' },
        { label: 'CA Returns',   value: stats.caReturns,  icon: RiFileChartLine,    accentClass: 'accent-pink',    iconBg: '#fdf2f8', iconColor: '#ec4899' },
        { label: 'Total Docs',   value: stats.totalDocs,  icon: RiFolder3Line,      accentClass: 'accent-emerald', iconBg: '#ecfdf5', iconColor: '#10b981' },
      ];

  return (
    <Layout>
      <motion.section
        className="max-w-5xl mx-auto space-y-9"
        variants={VARIANTS.page}
        initial="hidden"
        animate="show"
      >

        {/* ── Hero ──────────────────────────────────────────────────────────── */}
        <motion.div variants={VARIANTS.item}>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <p className="section-label flex items-center gap-1.5 mb-2">
                <RiCalendarLine />
                {now.toLocaleDateString('en-IN', {
                  weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
                })}
              </p>
              <h1
                className="font-extrabold text-[#0d1117]"
                style={{ fontSize: 28, letterSpacing: '-0.03em', lineHeight: 1.2 }}
              >
                {greeting}, {user?.name?.split(' ')[0]}.
              </h1>
              <p className="text-sm text-[#8896a4] mt-1 font-medium">
                Financial Year {fyStart}–{String(fyStart + 1).slice(2)}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {isCA && (
                <Link to="/clients" className="btn">
                  <RiAddLine /> Add Client
                </Link>
              )}
              <Link to="/documents" className="btn">
                <RiUploadCloudLine /> Upload
              </Link>
              <Link to="/clients" className="btn-secondary">
                All Clients <RiArrowRightLine />
              </Link>
            </div>
          </div>

          {/* Stat cards */}
          <motion.div
            className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-7"
            variants={VARIANTS.page}
          >
            {statCards.map(sc => (
              <StatCard key={sc.label} {...sc} loading={loading} />
            ))}
          </motion.div>
        </motion.div>

        {/* ── Announcements ─────────────────────────────────────────────────── */}
        {announcements.length > 0 && (
          <motion.div variants={VARIANTS.item}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[15px] font-bold text-[#0d1117] tracking-tight">
                Latest Updates
              </h2>
              <Link
                to="/announcements"
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 transition-colors"
              >
                View all <RiArrowRightLine />
              </Link>
            </div>
            <div className="space-y-2">
              {announcements.map((ann) => (
                <div
                  key={ann._id}
                  className={`card flex items-start gap-3.5 px-5 py-4 ${
                    ann.isImportant ? 'border-l-[3px] border-l-red-400' : ''
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      ann.isImportant ? 'bg-red-50' : 'bg-indigo-50'
                    }`}
                  >
                    {ann.isImportant ? (
                      <RiAlertLine className="text-red-500 text-sm" />
                    ) : (
                      <RiMegaphoneLine className="text-indigo-500 text-sm" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#0d1117] leading-snug">
                      {ann.title}
                    </p>
                    <p className="text-xs text-[#8896a4] mt-0.5 line-clamp-1">{ann.content}</p>
                  </div>
                  <span className="text-[11px] font-medium text-[#8896a4] flex-shrink-0 mt-0.5 whitespace-nowrap">
                    {new Date(ann.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'short',
                    })}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── Client grid ───────────────────────────────────────────────────── */}
        <motion.div variants={VARIANTS.item}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[15px] font-bold text-[#0d1117] tracking-tight flex items-center gap-2">
              <RiBuilding2Line className="text-[#8896a4]" />
              {isCA ? 'Your Clients' : 'Assigned Clients'}
            </h2>
            <Link
              to="/clients"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 transition-colors"
            >
              View all <RiArrowRightLine />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-[110px] shimmer rounded-[14px]" />
              ))}
            </div>
          ) : clients.length === 0 ? (
            <div className="card py-20 flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-xl bg-[#f4f6fa] flex items-center justify-center mb-2">
                <RiBuilding2Line className="text-xl text-[#c8d0dc]" />
              </div>
              <p className="text-sm font-semibold text-[#8896a4]">No clients yet</p>
              {isCA && (
                <Link
                  to="/clients"
                  className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  Add your first client →
                </Link>
              )}
            </div>
          ) : (
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
              variants={VARIANTS.page}
            >
              {clients.map((client, i) => (
                <ClientCard key={client._id} client={client} index={i} />
              ))}
            </motion.div>
          )}
        </motion.div>

        {/* ── Staff ─────────────────────────────────────────────────────────── */}
        {isCA && staff.length > 0 && (
          <motion.div variants={VARIANTS.item}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[15px] font-bold text-[#0d1117] tracking-tight flex items-center gap-2">
                <RiTeamLine className="text-[#8896a4]" /> Your Team
              </h2>
              <Link
                to="/users"
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 transition-colors"
              >
                Manage <RiArrowRightLine />
              </Link>
            </div>
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 gap-3"
              variants={VARIANTS.page}
            >
              {staff.map((m, i) => (
                <StaffCard key={m._id} member={m} index={i} />
              ))}
            </motion.div>
          </motion.div>
        )}

        {/* ── Recent documents ──────────────────────────────────────────────── */}
        <motion.div variants={VARIANTS.item}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[15px] font-bold text-[#0d1117] tracking-tight">
              Recent Documents
            </h2>
            <Link
              to="/documents"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 transition-colors"
            >
              View all <RiArrowRightLine />
            </Link>
          </div>

          <div className="card overflow-hidden" style={{ padding: 0 }}>
            {loading ? (
              [...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 px-5 py-3.5 border-b border-[#f1f5f9] last:border-0"
                >
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
                <div className="w-12 h-12 rounded-xl bg-[#f4f6fa] flex items-center justify-center mb-1">
                  <RiFileTextLine className="text-xl text-[#c8d0dc]" />
                </div>
                <p className="text-sm font-semibold text-[#8896a4]">No documents yet</p>
              </div>
            ) : (
              recentDocs.map((doc) => {
                const { icon: DocIcon, color, bg } = mimeIcon(doc.mimeType);
                return (
                  <div
                    key={doc._id}
                    className="flex items-center gap-4 px-5 py-3.5 hover:bg-[#f8fafc] transition-colors border-b border-[#f1f5f9] last:border-0 group"
                  >
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: bg }}
                    >
                      <DocIcon style={{ color }} className="text-base" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#0d1117] truncate">
                        {doc.originalName}
                      </p>
                      <p className="text-xs text-[#8896a4] mt-0.5 truncate">
                        {doc._clientName} · {doc.uploadedBy?.name}
                      </p>
                    </div>
                    <span className="text-[11px] font-medium text-[#8896a4] flex-shrink-0">
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
