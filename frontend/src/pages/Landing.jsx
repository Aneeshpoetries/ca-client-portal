import { useRef, useEffect, useState } from 'react';
import { motion, useInView, animate, AnimatePresence, useScroll, useTransform, useSpring } from 'framer-motion';
import LoginModal from '../components/LoginModal';
import {
  RiBriefcase4Line, RiFileUserLine, RiArrowRightLine,
  RiMenuLine, RiCloseLine, RiFlashlightLine,
  RiFileTextLine, RiCalendarLine, RiMegaphoneLine,
  RiShieldCheckLine, RiTeamLine, RiDashboardLine,
  RiGlobalLine, RiStarFill, RiBarChartBoxLine,
  RiBriefcaseLine, RiFileChartLine, RiFileLine,
} from 'react-icons/ri';

function Counter({ to, suffix = '' }) {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  useEffect(() => {
    if (!inView) return;
    const c = animate(0, to, { duration: 2.2, ease: 'easeOut', onUpdate: v => setVal(Math.floor(v)) });
    return c.stop;
  }, [inView, to]);
  return <span ref={ref}>{val.toLocaleString()}{suffix}</span>;
}

const FLOAT_DOCS = [
  {
    icon: RiFileChartLine, color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.25)',
    title: 'GST Return Q3', sub: 'Due: Dec 31, 2025', status: 'Pending', statusBg: 'rgba(245,158,11,0.14)', statusColor: '#d97706',
    rows: [['GSTIN', '27AABCU9603R1ZX'], ['Period', 'Jul–Sep 2025']],
    style: { top: '18%', left: '2%' }, delay: 0, duration: 5,
  },
  {
    icon: RiFileLine, color: '#20b89a', bg: 'rgba(32,184,154,0.12)', border: 'rgba(32,184,154,0.25)',
    title: 'ITR Filing FY25', sub: 'Ravi Kumar', status: 'Filed ✓', statusBg: 'rgba(32,184,154,0.14)', statusColor: '#0d9488',
    rows: [['Taxable Income', '₹8.4L'], ['Tax Paid', '₹92,000']],
    style: { top: '14%', right: '2%' }, delay: 1.2, duration: 6,
  },
  {
    icon: RiBarChartBoxLine, color: '#6366f1', bg: 'rgba(99,102,241,0.12)', border: 'rgba(99,102,241,0.25)',
    title: 'Balance Sheet', sub: 'FY 2024–25', status: 'Review', statusBg: 'rgba(99,102,241,0.14)', statusColor: '#4f46e5',
    rows: [['Total Assets', '₹42.1L'], ['Net Profit', '₹6.8L']],
    style: { bottom: '28%', right: '2%' }, delay: 0.7, duration: 5.5,
  },
];

function FloatingDocCard({ doc }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.88 }}
      animate={{ opacity: 1, scale: 1, y: [0, doc.duration % 2 === 0 ? -12 : 10, 0] }}
      transition={{
        opacity: { duration: 0.7, delay: doc.delay },
        scale:   { duration: 0.7, delay: doc.delay },
        y: { duration: doc.duration, repeat: Infinity, ease: 'easeInOut', delay: doc.delay },
      }}
      className="absolute w-[210px] hidden xl:block"
      style={{ ...doc.style, zIndex: 5 }}>
      <div className="rounded-2xl p-4 backdrop-blur-sm"
        style={{ background: 'rgba(255,255,255,0.92)', border: `1px solid ${doc.border}`, boxShadow: `0 8px 32px rgba(0,0,0,0.10), 0 0 0 1px ${doc.border}` }}>
        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: doc.bg }}>
            <doc.icon style={{ color: doc.color, fontSize: 15 }} />
          </div>
          <div>
            <div className="text-[11px] font-bold text-gray-800 leading-tight">{doc.title}</div>
            <div className="text-[9px] text-gray-400 mt-0.5">{doc.sub}</div>
          </div>
        </div>
        <div className="space-y-1.5 mb-3">
          {doc.rows.map(([k, v]) => (
            <div key={k} className="flex items-center justify-between">
              <span className="text-[9px] text-gray-400">{k}</span>
              <span className="text-[9px] font-semibold text-gray-700">{v}</span>
            </div>
          ))}
        </div>
        <div className="inline-flex items-center px-2.5 py-1 rounded-full text-[9px] font-bold"
          style={{ background: doc.statusBg, color: doc.statusColor }}>{doc.status}</div>
      </div>
    </motion.div>
  );
}

function DashboardMockup() {
  return (
    <div className="w-full rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(0,0,0,0.08)', boxShadow: '0 24px 64px rgba(0,0,0,0.12)' }}>
      <div className="h-8 flex items-center px-3 gap-3 border-b border-gray-100" style={{ background: '#f9fafb' }}>
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
        </div>
        <div className="flex-1 bg-white rounded h-4 flex items-center px-2 max-w-xs mx-auto border border-gray-200">
          <span className="text-[9px] text-gray-400 font-mono">ca-portal.app/dashboard</span>
        </div>
      </div>
      <div className="flex" style={{ height: 300, background: '#f8faf9' }}>
        <div className="w-12 flex flex-col items-center py-3 gap-3 border-r border-gray-100 bg-white">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#20b89a] to-[#6366f1] flex items-center justify-center mb-1">
            <RiBriefcaseLine style={{ color: 'white', fontSize: 11 }} />
          </div>
          {[RiDashboardLine, RiTeamLine, RiFileTextLine, RiMegaphoneLine, RiCalendarLine].map((Icon, idx) => (
            <div key={idx} className="w-7 h-7 rounded-lg flex items-center justify-center text-sm"
              style={{ background: idx === 0 ? 'rgba(32,184,154,0.12)' : 'transparent', color: idx === 0 ? '#20b89a' : '#94a3b8' }}>
              <Icon />
            </div>
          ))}
        </div>
        <div className="flex-1 p-4 overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-[9px] text-gray-400">Good morning,</div>
              <div className="text-xs font-bold text-gray-800">CA Sharma & Associates</div>
            </div>
            <div className="flex items-center gap-1 rounded-lg px-2 py-0.5"
              style={{ background: 'rgba(32,184,154,0.10)', border: '1px solid rgba(32,184,154,0.2)' }}>
              <div className="w-1 h-1 rounded-full bg-[#20b89a] animate-pulse" />
              <span className="text-[8px] text-[#20b89a] font-medium">3 deadlines this week</span>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-1.5 mb-3">
            {[['24','Clients','#20b89a','rgba(32,184,154,0.08)'],['156','Docs','#6366f1','rgba(99,102,241,0.08)'],['7','Pending','#f59e0b','rgba(245,158,11,0.08)'],['12','Filed','#10b981','rgba(16,185,129,0.08)']].map(([n,l,c,bg]) => (
              <div key={l} className="rounded-xl p-2 border border-gray-100" style={{ background: bg }}>
                <div className="text-sm font-bold" style={{ color: c }}>{n}</div>
                <div className="text-[8px] text-gray-400">{l}</div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl bg-white border border-gray-100 shadow-sm p-2.5">
              <div className="text-[9px] font-bold text-gray-500 mb-2">Recent Clients</div>
              {[['RK','Ravi Kumar','#20b89a'],['AM','Anita M.','#6366f1'],['SP','Suresh P.','#a78bfa']].map(([av,nm,c]) => (
                <div key={nm} className="flex items-center gap-1.5 mb-1.5">
                  <div className="w-4 h-4 rounded-full flex items-center justify-center text-[7px] font-bold" style={{ background: `${c}18`, color: c }}>{av}</div>
                  <span className="text-[9px] text-gray-600">{nm}</span>
                </div>
              ))}
            </div>
            <div className="rounded-xl bg-white border border-gray-100 shadow-sm p-2.5">
              <div className="text-[9px] font-bold text-gray-500 mb-2">Announcements</div>
              {['GST deadline extended to Dec 31','ITR portal live now','Q3 audit ready'].map((msg,i) => (
                <div key={i} className="flex items-start gap-1 mb-1.5">
                  <div className="w-1 h-1 rounded-full mt-1.5 flex-shrink-0" style={{ background: ['#f59e0b','#20b89a','#6366f1'][i] }} />
                  <span className="text-[8px] text-gray-500 leading-tight">{msg}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── scroll-animated mockup ────────────────────────────────────────────────────
function MockupReveal() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'center center'] });

  const rawScale   = useTransform(scrollYProgress, [0, 1], [0.78, 1]);
  const rawY       = useTransform(scrollYProgress, [0, 1], [80, 0]);
  const rawOpacity = useTransform(scrollYProgress, [0, 0.35], [0, 1]);
  const rawRotateX = useTransform(scrollYProgress, [0, 1], [22, 0]);

  const scale   = useSpring(rawScale,   { stiffness: 80, damping: 22 });
  const y       = useSpring(rawY,       { stiffness: 80, damping: 22 });
  const rotateX = useSpring(rawRotateX, { stiffness: 80, damping: 22 });

  return (
    <div ref={ref} className="relative z-10 w-full max-w-4xl px-4 md:px-8 pb-0" style={{ perspective: '1200px' }}>
      <motion.div style={{ scale, y, opacity: rawOpacity, rotateX, transformOrigin: 'top center' }}>
        {/* Glow below */}
        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-3/4 h-16 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse, rgba(32,184,154,0.28) 0%, transparent 70%)', filter: 'blur(20px)' }} />
        {/* Laptop chrome */}
        <div className="rounded-t-2xl px-2 pt-2 border-2 border-gray-200 border-b-0"
          style={{ background: 'linear-gradient(145deg,#e8f5f1,#eef0fb)' }}>
          <DashboardMockup />
        </div>
        <div className="h-2.5 mx-1.5 border-x-2 border-b-2 border-gray-200" style={{ background: '#e2e8f0' }} />
        <div className="h-1.5 mx-4 rounded-b-xl border-x-2 border-b-2 border-gray-200" style={{ background: '#cbd5e1' }} />
      </motion.div>
    </div>
  );
}

function Navbar({ onLogin }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);
  const scrollTo = id => { document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }); setOpen(false); };

  return (
    <motion.nav initial={{ y: -60, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
      className="fixed top-0 inset-x-0 z-50 h-16 flex items-center justify-between px-5 md:px-12"
      style={{
        background: scrolled ? 'rgba(255,255,255,0.96)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(0,0,0,0.06)' : 'none',
        boxShadow: scrolled ? '0 2px 16px rgba(0,0,0,0.06)' : 'none',
        transition: 'all 0.3s ease',
      }}>
      <div className="flex items-center gap-2.5 cursor-pointer select-none" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#20b89a] to-[#6366f1] flex items-center justify-center">
          <RiBriefcaseLine className="text-white text-sm" />
        </div>
        <span className="font-bold text-lg tracking-tight" style={{ color: '#0f172a' }}>CA<span className="text-[#20b89a]">Portal</span></span>
      </div>

      <div className="hidden md:flex items-center gap-7 text-sm text-gray-500">
        {[['Features','features'],['How It Works','how'],['Stats','stats']].map(([l,id]) => (
          <button key={id} onClick={() => scrollTo(id)} className="hover:text-gray-900 transition-colors">{l}</button>
        ))}
      </div>

      <div className="hidden md:flex items-center gap-2.5">
        <button onClick={() => onLogin('client')}
          className="flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-lg border transition-all hover:scale-105"
          style={{ borderColor: 'rgba(99,102,241,0.4)', color: '#6366f1', background: 'rgba(99,102,241,0.06)' }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(99,102,241,0.12)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(99,102,241,0.06)'}>
          <RiFileUserLine /> Client Login
        </button>
        <button onClick={() => onLogin('ca')}
          className="flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-lg text-white transition-all hover:scale-105"
          style={{ background: 'linear-gradient(135deg,#20b89a,#0e8a74)', boxShadow: '0 4px 14px rgba(32,184,154,0.40)' }}>
          <RiBriefcase4Line /> CA Login
        </button>
      </div>

      <button className="md:hidden text-gray-700 text-xl" onClick={() => setOpen(o => !o)}>
        {open ? <RiCloseLine /> : <RiMenuLine />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            className="absolute top-16 inset-x-0 bg-white border-b border-gray-100 shadow-lg px-6 py-5 flex flex-col gap-4 md:hidden">
            {[['Features','features'],['How It Works','how'],['Stats','stats']].map(([l,id]) => (
              <button key={id} onClick={() => scrollTo(id)} className="text-gray-600 text-left text-sm">{l}</button>
            ))}
            <button onClick={() => { onLogin('client'); setOpen(false); }}
              className="text-sm font-semibold py-2.5 rounded-xl border text-center"
              style={{ borderColor: 'rgba(99,102,241,0.4)', color: '#6366f1' }}>Login as Client</button>
            <button onClick={() => { onLogin('ca'); setOpen(false); }}
              className="text-sm font-semibold py-2.5 rounded-xl text-white text-center"
              style={{ background: 'linear-gradient(135deg,#20b89a,#0e8a74)' }}>Login as CA</button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}

function Hero({ onLogin }) {
  return (
    <section className="relative min-h-screen flex flex-col items-center overflow-hidden pt-16"
      style={{
        background: 'linear-gradient(145deg, #edfaf6 0%, #f0f4ff 40%, #faf5ff 70%, #fff7ed 100%)',
      }}>

      {/* Mesh gradient blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full opacity-40"
          style={{ background: 'radial-gradient(circle, rgba(32,184,154,0.30) 0%, transparent 60%)', filter: 'blur(60px)' }} />
        <div className="absolute -top-20 right-0 w-[500px] h-[500px] rounded-full opacity-30"
          style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.28) 0%, transparent 60%)', filter: 'blur(70px)' }} />
        <div className="absolute bottom-32 left-1/4 w-[400px] h-[400px] rounded-full opacity-25"
          style={{ background: 'radial-gradient(circle, rgba(167,139,250,0.30) 0%, transparent 60%)', filter: 'blur(60px)' }} />
      </div>

      {/* Dot grid */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: 'radial-gradient(rgba(32,184,154,0.22) 1px, transparent 1px)',
        backgroundSize: '32px 32px',
        maskImage: 'radial-gradient(ellipse 85% 75% at 50% 40%, black 30%, transparent 100%)',
        WebkitMaskImage: 'radial-gradient(ellipse 85% 75% at 50% 40%, black 30%, transparent 100%)',
      }} />

      {FLOAT_DOCS.map((doc, i) => <FloatingDocCard key={i} doc={doc} />)}

      <div className="relative z-10 flex flex-col items-center text-center px-6 pt-14 pb-10 max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-6 tracking-wide"
          style={{ background: 'linear-gradient(135deg,rgba(32,184,154,0.15),rgba(99,102,241,0.12))', border: '1px solid rgba(32,184,154,0.30)', color: '#0d9488' }}>
          <RiFlashlightLine /> Purpose-built for CA Firms & Audit Practices
        </motion.div>

        {/* Character-by-character headline */}
        {(() => {
          const charVariants = {
            hidden:  { opacity: 0, y: 24, filter: 'blur(5px)' },
            visible: { opacity: 1, y: 0,  filter: 'blur(0px)', transition: { duration: 0.35, ease: [0.23, 1, 0.32, 1] } },
          };
          const line1 = Array.from('Built for modern');
          const line2 = Array.from('CA practices.');
          // total chars = 16 + 13 = 29, stagger 0.04s each → last char at 0.15 + 28*0.04 = 1.27s, done ≈ 1.62s
          return (
            <motion.h1
              className="text-5xl md:text-7xl font-black leading-tight tracking-tight mb-5"
              style={{ letterSpacing: '-0.03em', color: '#0f172a' }}
              initial="hidden" animate="visible"
              variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.04, delayChildren: 0.15 } } }}>
              {line1.map((ch, i) => (
                <motion.span key={`l1-${i}`} variants={charVariants}
                  style={{ display: 'inline-block', whiteSpace: ch === ' ' ? 'pre' : 'normal' }}>
                  {ch === ' ' ? ' ' : ch}
                </motion.span>
              ))}
              <br />
              {line2.map((ch, i) => (
                <motion.span key={`l2-${i}`} variants={charVariants}
                  style={{
                    display: 'inline-block',
                    whiteSpace: ch === ' ' ? 'pre' : 'normal',
                    background: 'linear-gradient(135deg,#20b89a 0%,#6366f1 55%,#a78bfa 100%)',
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                  }}>
                  {ch === ' ' ? ' ' : ch}
                </motion.span>
              ))}
            </motion.h1>
          );
        })()}

        {/* Subtitle — appears after headline finishes (~1.65s) */}
        <motion.p
          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.65, duration: 0.65, ease: 'easeOut' }}
          className="text-gray-500 text-lg max-w-lg mb-10 leading-relaxed">
          Manage clients, documents, GST returns, and your team — all in one place.
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 2.25, duration: 0.6 }}
          className="flex items-center justify-center gap-3 flex-wrap">
          <button onClick={() => onLogin('ca')}
            className="group flex items-center gap-2 px-6 py-3.5 rounded-xl text-white font-bold text-sm transition-all hover:scale-105 hover:shadow-xl"
            style={{ background: 'linear-gradient(135deg,#20b89a,#0e8a74)', boxShadow: '0 6px 24px rgba(32,184,154,0.45)' }}>
            <RiBriefcase4Line /> Login as CA <RiArrowRightLine className="group-hover:translate-x-1 transition-transform" />
          </button>
          <button onClick={() => onLogin('client')}
            className="flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm transition-all hover:scale-105"
            style={{ background: 'rgba(99,102,241,0.1)', border: '1.5px solid rgba(99,102,241,0.35)', color: '#6366f1' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(99,102,241,0.16)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(99,102,241,0.1)'}>
            <RiFileUserLine /> Login as Client
          </button>
        </motion.div>
      </div>

      {/* Dashboard mockup — scroll-triggered 3D zoom */}
      <MockupReveal />

      <div className="absolute bottom-0 inset-x-0 h-32 pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, transparent, #f0f4ff)' }} />
    </section>
  );
}

const FEATURES = [
  { icon: RiDashboardLine,   c: '#20b89a', bg: 'rgba(32,184,154,0.10)',  label: 'Live Dashboard',      desc: 'Real-time view of every client, filing, and document at a glance.' },
  { icon: RiFileTextLine,    c: '#6366f1', bg: 'rgba(99,102,241,0.10)',  label: 'Document Management', desc: 'Clients upload directly; you review, approve, and archive. No email chains.' },
  { icon: RiTeamLine,        c: '#a78bfa', bg: 'rgba(167,139,250,0.10)', label: 'Team Access Control', desc: 'Role-based access for CA, staff, and clients. Everyone sees only what they need.' },
  { icon: RiCalendarLine,    c: '#0ea5e9', bg: 'rgba(14,165,233,0.10)',  label: 'Deadline Tracker',    desc: 'Never miss GST, ITR, or ROC deadlines. Smart reminders and color-coded urgency.' },
  { icon: RiMegaphoneLine,   c: '#f472b6', bg: 'rgba(244,114,182,0.10)', label: 'Announcements',       desc: 'Push deadline notices and policy updates to all clients in one click.' },
  { icon: RiShieldCheckLine, c: '#10b981', bg: 'rgba(16,185,129,0.10)',  label: 'Bank-Grade Security', desc: 'End-to-end encryption, audit logs, and secure auth — your data stays yours.' },
];

function Features() {
  return (
    <section id="features" className="py-28" style={{ background: 'linear-gradient(180deg,#f0f4ff 0%,#faf5ff 100%)' }}>
      <div className="max-w-screen-xl mx-auto px-6 md:px-14">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="text-center mb-16">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-3"
            style={{ background: 'rgba(99,102,241,0.10)', color: '#6366f1' }}>Features</span>
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">Everything your firm needs</h2>
          <p className="text-gray-500 text-base max-w-lg mx-auto">From onboarding clients to filing returns — every workflow in one platform.</p>
        </motion.div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f, i) => (
            <motion.div key={f.label}
              initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.07 }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="group relative rounded-2xl p-6 bg-white overflow-hidden"
              style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.05)' }}>
              {/* color top stripe */}
              <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl" style={{ background: f.c }} />
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                style={{ background: `radial-gradient(circle at 20% 20%, ${f.c}12 0%, transparent 60%)` }} />
              <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-5 text-xl" style={{ background: f.bg, color: f.c }}><f.icon /></div>
              <h3 className="text-gray-900 font-bold text-base mb-2">{f.label}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

const STEPS = [
  { n: '01', label: 'Create your firm',  desc: 'Sign up as a CA and set up your practice profile in under 2 minutes.', c: '#20b89a', bg: 'rgba(32,184,154,0.10)' },
  { n: '02', label: 'Invite clients',    desc: 'Send secure invite links; clients get their own portal instantly.',       c: '#6366f1', bg: 'rgba(99,102,241,0.10)' },
  { n: '03', label: 'Manage everything', desc: 'Review docs, track deadlines, post announcements, manage staff.',         c: '#a78bfa', bg: 'rgba(167,139,250,0.10)' },
  { n: '04', label: 'File & close',      desc: 'File returns, mark tasks done, keep a clean permanent audit trail.',      c: '#10b981', bg: 'rgba(16,185,129,0.10)' },
];

function HowItWorks() {
  return (
    <section id="how" className="py-28 relative overflow-hidden bg-white">
      <div className="absolute inset-0 pointer-events-none"
        style={{ backgroundImage: 'linear-gradient(rgba(99,102,241,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,0.04) 1px,transparent 1px)', backgroundSize: '48px 48px' }} />
      {/* Soft blobs */}
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full pointer-events-none opacity-30"
        style={{ background: 'radial-gradient(circle,rgba(167,139,250,0.25) 0%,transparent 65%)', filter: 'blur(60px)' }} />
      <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full pointer-events-none opacity-20"
        style={{ background: 'radial-gradient(circle,rgba(32,184,154,0.25) 0%,transparent 65%)', filter: 'blur(50px)' }} />
      <div className="relative max-w-screen-xl mx-auto px-6 md:px-14">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="text-center mb-16">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-3"
            style={{ background: 'rgba(167,139,250,0.12)', color: '#a78bfa' }}>How It Works</span>
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">Up and running in minutes</h2>
          <p className="text-gray-500 text-base max-w-lg mx-auto">No training. No setup fees. Built the way CA firms actually work.</p>
        </motion.div>
        <div className="grid md:grid-cols-4 gap-6 relative">
          <div className="hidden md:block absolute top-10 left-[12%] right-[12%] h-px"
            style={{ background: 'linear-gradient(90deg,transparent,#20b89a,#6366f1,#a78bfa,transparent)' }} />
          {STEPS.map((s, i) => (
            <motion.div key={s.n} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }} className="relative text-center">
              <div className="w-20 h-20 rounded-2xl mx-auto mb-5 flex items-center justify-center text-2xl font-black relative z-10"
                style={{ background: s.bg, border: `1.5px solid ${s.c}30`, color: s.c, boxShadow: `0 4px 20px ${s.c}25` }}>{s.n}</div>
              <h3 className="text-gray-900 font-bold mb-2">{s.label}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Stats() {
  return (
    <section id="stats" className="py-24" style={{ background: 'linear-gradient(135deg,#edfaf6 0%,#eef2ff 50%,#faf5ff 100%)' }}>
      <div className="max-w-screen-xl mx-auto px-6 md:px-14">
        <div className="rounded-3xl p-12 relative overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.75)', border: '1px solid rgba(255,255,255,0.9)', backdropFilter: 'blur(20px)', boxShadow: '0 8px 40px rgba(0,0,0,0.07)' }}>
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: 'linear-gradient(135deg,rgba(32,184,154,0.06) 0%,rgba(99,102,241,0.06) 50%,rgba(167,139,250,0.06) 100%)' }} />
          <div className="relative grid grid-cols-2 md:grid-cols-4 gap-10 text-center">
            {[
              { to: 500,   suffix: '+',   label: 'CA Firms',        c: '#20b89a' },
              { to: 10000, suffix: '+',   label: 'Docs Managed',    c: '#6366f1' },
              { to: 50000, suffix: '+',   label: 'Filings Tracked', c: '#a78bfa' },
              { to: 99,    suffix: '.9%', label: 'Uptime SLA',      c: '#10b981' },
            ].map((s, i) => (
              <motion.div key={s.label} initial={{ opacity: 0, scale: 0.85 }} whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }}>
                <div className="text-4xl md:text-5xl font-black mb-1" style={{ color: s.c }}>
                  <Counter to={s.to} suffix={s.suffix} />
                </div>
                <div className="text-gray-500 text-sm">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function CTA({ onLogin }) {
  return (
    <section className="py-28 relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg,#0f172a 0%,#1e1b4b 40%,#0f2d25 100%)' }}>
      {/* Blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle,rgba(32,184,154,0.5) 0%,transparent 65%)', filter: 'blur(70px)' }} />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle,rgba(99,102,241,0.5) 0%,transparent 65%)', filter: 'blur(60px)' }} />
      </div>
      <div className="relative max-w-2xl mx-auto px-6 text-center">
        <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
          <div className="flex items-center justify-center gap-1 mb-5">
            {[...Array(5)].map((_,i) => <RiStarFill key={i} className="text-[#f59e0b] text-base" />)}
            <span className="text-gray-400 text-xs ml-2">Trusted by CA firms across India</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4 leading-tight">
            Ready to modernise<br />
            <span style={{ background: 'linear-gradient(120deg,#20b89a,#6366f1,#a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              your practice?
            </span>
          </h2>
          <p className="text-gray-400 text-base mb-10">Join hundreds of firms managing smarter, not harder.</p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <button onClick={() => onLogin('ca')}
              className="group flex items-center gap-2 px-8 py-4 rounded-xl text-white font-bold text-base transition-all hover:scale-105"
              style={{ background: 'linear-gradient(135deg,#20b89a,#0e8a74)', boxShadow: '0 6px 28px rgba(32,184,154,0.50)' }}>
              <RiBriefcase4Line /> Get Started as CA <RiArrowRightLine className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button onClick={() => onLogin('client')}
              className="flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-base transition-all hover:scale-105"
              style={{ background: 'rgba(255,255,255,0.08)', border: '1.5px solid rgba(255,255,255,0.18)', color: '#e2e8f0' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.14)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}>
              <RiFileUserLine /> Login as Client
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-gray-100 py-8 bg-white">
      <div className="max-w-screen-xl mx-auto px-6 md:px-14 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 select-none">
          <div className="w-6 h-6 rounded-md bg-gradient-to-br from-[#20b89a] to-[#6366f1] flex items-center justify-center">
            <RiBriefcaseLine className="text-white text-xs" />
          </div>
          <span className="text-gray-800 font-bold text-sm">CA<span className="text-[#20b89a]">Portal</span></span>
        </div>
        <p className="text-gray-400 text-xs">© 2025 CAPortal. Built for modern CA practices.</p>
        <div className="flex items-center gap-5 text-xs text-gray-400">
          <span className="flex items-center gap-1"><RiShieldCheckLine className="text-[#20b89a]" />Secure</span>
          <span className="flex items-center gap-1"><RiGlobalLine className="text-[#6366f1]" />India-first</span>
          <span className="flex items-center gap-1"><RiBarChartBoxLine className="text-[#a78bfa]" />99.9% uptime</span>
        </div>
      </div>
    </footer>
  );
}

export default function Landing() {
  const [modalRole, setModalRole] = useState(null);
  return (
    <div style={{ fontFamily: 'inherit', overflowX: 'hidden' }}>
      <Navbar onLogin={setModalRole} />
      <Hero onLogin={setModalRole} />
      <Features />
      <HowItWorks />
      <Stats />
      <CTA onLogin={setModalRole} />
      <Footer />
      <AnimatePresence>
        {modalRole !== null && (
          <LoginModal key="login-modal" role={modalRole} onClose={() => setModalRole(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
