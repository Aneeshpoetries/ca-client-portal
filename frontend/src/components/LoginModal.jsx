import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  RiCloseLine, RiMailLine, RiLockLine, RiEyeLine, RiEyeOffLine,
  RiUser3Line, RiPhoneLine, RiCheckLine, RiArrowLeftLine,
  RiBriefcase4Line, RiFileUserLine,
} from 'react-icons/ri';

function GoogleButton({ onClick, isDark }) {
  return (
    <button type="button" onClick={onClick}
      className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-[10px] text-sm font-medium transition-all"
      style={{ border: `1px solid ${isDark ? '#2c3c34' : '#2c3c34'}`, color: '#ece9e4', background: '#1a2420' }}
      onMouseEnter={e => { e.currentTarget.style.background = '#202c28'; }}
      onMouseLeave={e => { e.currentTarget.style.background = '#1a2420'; }}>
      <svg width="18" height="18" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
      </svg>
      Continue with Google
    </button>
  );
}

function Divider() {
  return (
    <div className="flex items-center gap-3 my-5">
      <div className="flex-1 h-px" style={{ background: '#2c3c34' }} />
      <span className="text-xs font-medium" style={{ color: '#6a8880' }}>or</span>
      <div className="flex-1 h-px" style={{ background: '#2c3c34' }} />
    </div>
  );
}

function SignUpForm({ loading, setLoading, onClose }) {
  const [form, setForm]         = useState({ name: '', email: '', password: '', phone: '' });
  const [showPass, setShowPass] = useState(false);
  const { register }            = useAuth();
  const navigate                = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      await register(form);
      toast.success('Account created!');
      onClose();
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Sign up failed');
    } finally { setLoading(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3.5">
      {[
        { key: 'name',  label: 'Full name',     icon: RiUser3Line, type: 'text',  ph: 'Your name',       req: true },
        { key: 'email', label: 'Email address', icon: RiMailLine,  type: 'email', ph: 'you@example.com', req: true },
        { key: 'phone', label: 'Phone',         icon: RiPhoneLine, type: 'tel',   ph: '+91 XXXXX XXXXX', req: false },
      ].map(({ key, label, icon: Icon, type, ph, req }) => (
        <div key={key}>
          <label className="block text-xs font-semibold mb-1.5 text-[#b0c0b8]">{label}</label>
          <div className="relative">
            <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8896a4] text-sm" />
            <input type={type} required={req} value={form[key]}
              onChange={e => setForm({ ...form, [key]: e.target.value })}
              className="input-field pl-9" placeholder={ph} />
          </div>
        </div>
      ))}
      <div>
        <label className="block text-xs font-semibold mb-1.5 text-[#b0c0b8]">Password</label>
        <div className="relative">
          <RiLockLine className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8896a4] text-sm" />
          <input type={showPass ? 'text' : 'password'} required value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })}
            className="input-field pl-9 pr-10" placeholder="Min 6 characters" />
          <button type="button" onClick={() => setShowPass(v => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8896a4] hover:text-[#ece9e4] transition-colors">
            {showPass ? <RiEyeOffLine /> : <RiEyeLine />}
          </button>
        </div>
      </div>
      <button type="submit" disabled={loading} className="btn w-full justify-center py-3 text-[15px] mt-1">
        {loading ? <div className="border-2 border-white/30 border-t-white rounded-full animate-spin w-4 h-4" /> : 'Create account'}
      </button>
      <p className="text-xs text-center text-[#4a6860]">
        Staff & client accounts are added by the CA from inside the portal.
      </p>
    </form>
  );
}

export default function LoginModal({ role: initialRole, onClose }) {
  const [roleView, setRoleView] = useState(initialRole || null);
  const [tab, setTab]           = useState('signin');
  const [form, setForm]         = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const { login, googleLogin }  = useAuth();
  const { isDark }              = useTheme();
  const navigate                = useNavigate();

  // Close on Escape
  useEffect(() => {
    const fn = e => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [onClose]);

  const handleSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success('Welcome back!');
      onClose();
      navigate(user.role === 'client' ? '/portal' : '/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid email or password');
    } finally { setLoading(false); }
  };

  const handleGoogleSuccess = async (tokenResponse) => {
    setLoading(true);
    try {
      const user = await googleLogin(tokenResponse.access_token);
      toast.success('Signed in with Google!');
      onClose();
      navigate(user.role === 'client' ? '/portal' : '/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Google sign-in failed');
    } finally { setLoading(false); }
  };

  const triggerGoogle = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
    onError: () => toast.error('Google sign-in failed'),
    flow: 'implicit',
  });

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        key="modal-backdrop"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] flex items-center justify-center p-4"
        style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
        onClick={onClose}>

        {/* Modal card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.93, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.93, y: 24 }}
          transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
          className="relative w-full max-w-sm rounded-2xl p-7"
          style={{
            background: '#141c18',
            border: '1px solid rgba(32,184,154,0.14)',
            boxShadow: '0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(32,184,154,0.08)',
          }}
          onClick={e => e.stopPropagation()}>

          {/* Close button */}
          <button onClick={onClose}
            className="absolute top-4 right-4 w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
            style={{ color: '#6a8880', background: 'rgba(255,255,255,0.04)' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#ece9e4'; e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = '#6a8880'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}>
            <RiCloseLine className="text-base" />
          </button>

          <AnimatePresence mode="wait">

            {/* Role selector */}
            {roleView === null && (
              <motion.div key="role"
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                <h2 className="text-xl font-bold text-white mb-1">Welcome</h2>
                <p className="text-sm text-[#6a8880] mb-6">How would you like to continue?</p>
                <div className="space-y-3">
                  {[
                    { role: 'ca',     Icon: RiBriefcase4Line, label: 'CA / Accountant', sub: 'Manage clients, documents & staff', color: '#20b89a' },
                    { role: 'client', Icon: RiFileUserLine,   label: 'Client',           sub: 'Access your documents & returns',  color: '#6366f1' },
                  ].map(({ role, Icon, label, sub, color }) => (
                    <button key={role} onClick={() => setRoleView(role)}
                      className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl border text-left transition-all"
                      style={{ borderColor: '#2c3c34', background: 'transparent' }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor = color; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = '#2c3c34'; }}>
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: `${color}18` }}>
                        <Icon className="text-lg" style={{ color }} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">{label}</p>
                        <p className="text-xs text-[#6a8880] mt-0.5">{sub}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* CA view */}
            {roleView === 'ca' && (
              <motion.div key="ca"
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
                <button onClick={() => setRoleView(null)}
                  className="flex items-center gap-1.5 text-xs font-medium mb-5 text-[#6a8880] hover:text-white transition-colors">
                  <RiArrowLeftLine /> Back
                </button>
                <div className="flex rounded-xl p-1 mb-6" style={{ background: '#1a2420' }}>
                  {[{ key: 'signin', label: 'Sign in' }, { key: 'signup', label: 'Sign up' }].map(t => (
                    <button key={t.key} onClick={() => setTab(t.key)}
                      className="flex-1 py-2 rounded-lg text-sm font-semibold transition-all"
                      style={tab === t.key
                        ? { background: '#141c18', color: '#ece9e4', boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }
                        : { color: '#6a8880' }}>
                      {t.label}
                    </button>
                  ))}
                </div>
                <AnimatePresence mode="wait">
                  {tab === 'signin' ? (
                    <motion.div key="ca-si" initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 8 }} transition={{ duration: 0.15 }}>
                      <GoogleButton onClick={() => triggerGoogle()} isDark />
                      <Divider />
                      <form onSubmit={handleSignIn} className="space-y-3.5">
                        <div>
                          <label className="block text-xs font-semibold mb-1.5 text-[#b0c0b8]">Email address</label>
                          <div className="relative">
                            <RiMailLine className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8896a4] text-sm" />
                            <input type="email" required value={form.email}
                              onChange={e => setForm({ ...form, email: e.target.value })}
                              className="input-field pl-9" placeholder="you@example.com" autoFocus />
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <label className="block text-xs font-semibold text-[#b0c0b8]">Password</label>
                            <Link to="/forgot-password" onClick={onClose} className="text-xs text-indigo-500 hover:text-indigo-400 font-medium">Forgot?</Link>
                          </div>
                          <div className="relative">
                            <RiLockLine className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8896a4] text-sm" />
                            <input type={showPass ? 'text' : 'password'} required value={form.password}
                              onChange={e => setForm({ ...form, password: e.target.value })}
                              className="input-field pl-9 pr-10" placeholder="••••••••" />
                            <button type="button" onClick={() => setShowPass(v => !v)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8896a4] hover:text-[#ece9e4] transition-colors">
                              {showPass ? <RiEyeOffLine /> : <RiEyeLine />}
                            </button>
                          </div>
                        </div>
                        <button type="submit" disabled={loading} className="btn w-full justify-center py-3 text-[15px] mt-1">
                          {loading ? <div className="border-2 border-white/30 border-t-white rounded-full animate-spin w-4 h-4" /> : 'Sign in'}
                        </button>
                      </form>
                    </motion.div>
                  ) : (
                    <motion.div key="ca-su" initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }} transition={{ duration: 0.15 }}>
                      <GoogleButton onClick={() => triggerGoogle()} isDark />
                      <Divider />
                      <SignUpForm loading={loading} setLoading={setLoading} onClose={onClose} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {/* Client view */}
            {roleView === 'client' && (
              <motion.div key="client"
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
                <button onClick={() => setRoleView(null)}
                  className="flex items-center gap-1.5 text-xs font-medium mb-5 text-[#6a8880] hover:text-white transition-colors">
                  <RiArrowLeftLine /> Back
                </button>
                <h2 className="text-xl font-bold text-white mb-1">Client sign in</h2>
                <p className="text-sm text-[#6a8880] mb-6">Use the credentials your CA shared with you.</p>
                <form onSubmit={handleSignIn} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-semibold mb-1.5 text-[#b0c0b8]">Email address</label>
                    <div className="relative">
                      <RiMailLine className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8896a4] text-sm" />
                      <input type="email" required value={form.email}
                        onChange={e => setForm({ ...form, email: e.target.value })}
                        className="input-field pl-9" placeholder="you@example.com" autoFocus />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1.5 text-[#b0c0b8]">Password</label>
                    <div className="relative">
                      <RiLockLine className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8896a4] text-sm" />
                      <input type={showPass ? 'text' : 'password'} required value={form.password}
                        onChange={e => setForm({ ...form, password: e.target.value })}
                        className="input-field pl-9 pr-10" placeholder="••••••••" />
                      <button type="button" onClick={() => setShowPass(v => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8896a4] hover:text-[#ece9e4] transition-colors">
                        {showPass ? <RiEyeOffLine /> : <RiEyeLine />}
                      </button>
                    </div>
                  </div>
                  <button type="submit" disabled={loading} className="btn w-full justify-center py-3 text-[15px] mt-1">
                    {loading ? <div className="border-2 border-white/30 border-t-white rounded-full animate-spin w-4 h-4" /> : 'Sign in'}
                  </button>
                </form>
                <p className="text-center text-xs mt-5 text-[#3d5448]">Don't have credentials? Contact your CA.</p>
              </motion.div>
            )}

          </AnimatePresence>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
