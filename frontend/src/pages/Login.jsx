import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useGoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import {
  RiMailLine, RiLockLine, RiEyeLine, RiEyeOffLine,
  RiUser3Line, RiPhoneLine, RiCheckLine, RiArrowLeftLine,
  RiBriefcase4Line, RiFileUserLine,
} from 'react-icons/ri';
import { useTheme } from '../context/ThemeContext';

function GoogleButton({ onClick, label, isDark }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-[10px] text-sm font-medium transition-all"
      style={{
        border: `1px solid ${isDark ? '#2c3c34' : '#e1e7ef'}`,
        color: isDark ? '#ece9e4' : '#0d1117',
        background: isDark ? '#1a2420' : 'transparent',
      }}
      onMouseEnter={e => { e.currentTarget.style.background = isDark ? '#202c28' : '#f4f6fa'; }}
      onMouseLeave={e => { e.currentTarget.style.background = isDark ? '#1a2420' : 'transparent'; }}
    >
      <svg width="18" height="18" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
      </svg>
      {label}
    </button>
  );
}

function Divider({ isDark }) {
  return (
    <div className="flex items-center gap-3 my-5">
      <div className="flex-1 h-px" style={{ background: isDark ? '#2c3c34' : '#e1e7ef' }} />
      <span className="text-xs font-medium" style={{ color: isDark ? '#6a8880' : '#8896a4' }}>or</span>
      <div className="flex-1 h-px" style={{ background: isDark ? '#2c3c34' : '#e1e7ef' }} />
    </div>
  );
}

const FEATURES = [
  'Multi-client document management',
  'GST returns & ITR filing tracker',
  'Staff access control',
  'Secure file storage',
];

export default function Login() {
  const [searchParams]               = useSearchParams();
  const [roleView, setRoleView]      = useState(searchParams.get('role') || null);
  const [tab, setTab]                = useState('signin');
  const [signInForm, setSignInForm]  = useState({ email: '', password: '' });
  const [showPass, setShowPass]      = useState(false);
  const [loading, setLoading]        = useState(false);
  const { login, googleLogin }       = useAuth();
  const navigate                     = useNavigate();
  const { isDark }                   = useTheme();

  const handleSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(signInForm.email, signInForm.password);
      toast.success('Welcome back!');
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

  const textColor   = isDark ? '#ece9e4' : '#0d1117';
  const subColor    = isDark ? '#6a8880' : '#8896a4';
  const borderColor = isDark ? '#2c3c34' : '#e1e7ef';
  const cardBg      = isDark ? '#1a2420' : '#f9fafb';

  return (
    <div className="min-h-screen flex">

      {/* Left panel */}
      <div
        className="hidden lg:flex w-5/12 flex-col justify-between p-12 relative overflow-hidden"
        style={{
          background: `
            radial-gradient(ellipse 90% 70% at 0% 0%, rgba(20,138,116,0.30) 0%, transparent 60%),
            radial-gradient(ellipse 70% 55% at 100% 100%, rgba(14,92,79,0.18) 0%, transparent 55%),
            #080e0b
          `,
        }}
      >
        <div />

        <div className="relative z-[2] flex items-center gap-2.5 select-none">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #148a74, #0e5c4f)' }}>
            <span className="text-white text-xs font-bold">CA</span>
          </div>
          <span className="text-white font-semibold tracking-tight">Portal</span>
        </div>

        <div className="relative z-[2]">
          <h2 className="text-white font-extrabold mb-4" style={{ fontSize: 32, lineHeight: 1.2, letterSpacing: '-0.02em' }}>
            Built for modern<br />CA practices.
          </h2>
          <p className="text-sm leading-relaxed max-w-xs mb-10" style={{ color: '#94c8b8' }}>
            Manage clients, documents, GST returns, and your team — all in one place.
          </p>
          <div className="space-y-3.5">
            {FEATURES.map(f => (
              <div key={f} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(20,138,116,0.22)' }}>
                  <RiCheckLine className="text-xs" style={{ color: '#4dd4b0' }} />
                </div>
                <span className="text-sm" style={{ color: '#d0e8e0' }}>{f}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-[2] text-xs" style={{ color: '#2d5c48' }}>© 2025 CA Portal</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8"
        style={{ background: isDark ? '#141c18' : '#ffffff' }}>

        <div className="w-full max-w-sm">

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-10 select-none">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #148a74, #0e5c4f)' }}>
              <span className="text-white text-xs font-bold">CA</span>
            </div>
            <span className="font-semibold" style={{ color: textColor }}>Portal</span>
          </div>

          <AnimatePresence mode="wait">

            {/* ── STEP 1: Role selector ── */}
            {roleView === null && (
              <motion.div key="role-select"
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.22 }}>

                <h1 className="text-2xl font-bold mb-1" style={{ color: textColor }}>Welcome</h1>
                <p className="text-sm mb-8" style={{ color: subColor }}>How would you like to continue?</p>

                <div className="space-y-3">
                  <button
                    onClick={() => setRoleView('ca')}
                    className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl border text-left transition-all group"
                    style={{ borderColor, background: 'transparent' }}
                    onMouseEnter={e => { e.currentTarget.style.background = cardBg; e.currentTarget.style.borderColor = '#148a74'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = borderColor; }}
                  >
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: 'rgba(20,138,116,0.12)' }}>
                      <RiBriefcase4Line className="text-xl" style={{ color: '#148a74' }} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold" style={{ color: textColor }}>CA / Accountant</p>
                      <p className="text-xs mt-0.5" style={{ color: subColor }}>Manage clients, documents & staff</p>
                    </div>
                  </button>

                  <button
                    onClick={() => setRoleView('client')}
                    className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl border text-left transition-all"
                    style={{ borderColor, background: 'transparent' }}
                    onMouseEnter={e => { e.currentTarget.style.background = cardBg; e.currentTarget.style.borderColor = '#148a74'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = borderColor; }}
                  >
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: 'rgba(20,138,116,0.12)' }}>
                      <RiFileUserLine className="text-xl" style={{ color: '#148a74' }} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold" style={{ color: textColor }}>Client</p>
                      <p className="text-xs mt-0.5" style={{ color: subColor }}>Access your documents & returns</p>
                    </div>
                  </button>
                </div>
              </motion.div>
            )}

            {/* ── STEP 2a: CA login/signup ── */}
            {roleView === 'ca' && (
              <motion.div key="ca-view"
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.22 }}>

                <button onClick={() => setRoleView(null)}
                  className="flex items-center gap-1.5 text-xs font-medium mb-6 transition-colors"
                  style={{ color: subColor }}
                  onMouseEnter={e => e.currentTarget.style.color = textColor}
                  onMouseLeave={e => e.currentTarget.style.color = subColor}>
                  <RiArrowLeftLine /> Back
                </button>

                {/* Sign in / Sign up tabs */}
                <div className="flex rounded-xl p-1 mb-8"
                  style={{ background: isDark ? '#1a2420' : '#f4f6fa' }}>
                  {[{ key: 'signin', label: 'Sign in' }, { key: 'signup', label: 'Sign up' }].map(t => (
                    <button key={t.key} onClick={() => setTab(t.key)}
                      className="flex-1 py-2 rounded-lg text-sm font-semibold transition-all"
                      style={tab === t.key
                        ? { background: isDark ? '#141c18' : '#fff', color: textColor, boxShadow: '0 1px 3px rgba(0,0,0,0.12)' }
                        : { color: subColor }}>
                      {t.label}
                    </button>
                  ))}
                </div>

                <AnimatePresence mode="wait">
                  {tab === 'signin' ? (
                    <motion.div key="ca-signin"
                      initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 8 }} transition={{ duration: 0.18 }}>
                      <GoogleButton onClick={() => triggerGoogle()} label="Continue with Google" isDark={isDark} />
                      <Divider isDark={isDark} />
                      <form onSubmit={handleSignIn} className="space-y-4">
                        <div>
                          <label className="block text-xs font-semibold mb-1.5" style={{ color: isDark ? '#b0c0b8' : '#4a5568' }}>Email address</label>
                          <div className="relative">
                            <RiMailLine className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8896a4] text-sm" />
                            <input type="email" required value={signInForm.email}
                              onChange={e => setSignInForm({ ...signInForm, email: e.target.value })}
                              className="input-field pl-9" placeholder="you@example.com" autoFocus />
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <label className="block text-xs font-semibold" style={{ color: isDark ? '#b0c0b8' : '#4a5568' }}>Password</label>
                            <Link to="/forgot-password" className="text-xs text-indigo-600 hover:text-indigo-700 font-medium">Forgot?</Link>
                          </div>
                          <div className="relative">
                            <RiLockLine className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8896a4] text-sm" />
                            <input type={showPass ? 'text' : 'password'} required value={signInForm.password}
                              onChange={e => setSignInForm({ ...signInForm, password: e.target.value })}
                              className="input-field pl-9 pr-10" placeholder="••••••••" />
                            <button type="button" onClick={() => setShowPass(v => !v)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8896a4] hover:text-[#4a5568] transition-colors">
                              {showPass ? <RiEyeOffLine /> : <RiEyeLine />}
                            </button>
                          </div>
                        </div>
                        <button type="submit" disabled={loading} className="btn w-full justify-center py-3 text-[15px] mt-2">
                          {loading ? <div className="border-2 border-white/30 border-t-white rounded-full animate-spin w-4 h-4" /> : 'Sign in'}
                        </button>
                      </form>
                    </motion.div>
                  ) : (
                    <motion.div key="ca-signup"
                      initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -8 }} transition={{ duration: 0.18 }}>
                      <GoogleButton onClick={() => triggerGoogle()} label="Sign up with Google" isDark={isDark} />
                      <Divider isDark={isDark} />
                      <SignUpForm loading={loading} setLoading={setLoading} navigate={navigate} isDark={isDark} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {/* ── STEP 2b: Client login ── */}
            {roleView === 'client' && (
              <motion.div key="client-view"
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.22 }}>

                <button onClick={() => setRoleView(null)}
                  className="flex items-center gap-1.5 text-xs font-medium mb-6 transition-colors"
                  style={{ color: subColor }}
                  onMouseEnter={e => e.currentTarget.style.color = textColor}
                  onMouseLeave={e => e.currentTarget.style.color = subColor}>
                  <RiArrowLeftLine /> Back
                </button>

                <h2 className="text-xl font-bold mb-1" style={{ color: textColor }}>Client sign in</h2>
                <p className="text-sm mb-8" style={{ color: subColor }}>
                  Use the credentials your CA shared with you.
                </p>

                <form onSubmit={handleSignIn} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold mb-1.5" style={{ color: isDark ? '#b0c0b8' : '#4a5568' }}>Email address</label>
                    <div className="relative">
                      <RiMailLine className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8896a4] text-sm" />
                      <input type="email" required value={signInForm.email}
                        onChange={e => setSignInForm({ ...signInForm, email: e.target.value })}
                        className="input-field pl-9" placeholder="you@example.com" autoFocus />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1.5" style={{ color: isDark ? '#b0c0b8' : '#4a5568' }}>Password</label>
                    <div className="relative">
                      <RiLockLine className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8896a4] text-sm" />
                      <input type={showPass ? 'text' : 'password'} required value={signInForm.password}
                        onChange={e => setSignInForm({ ...signInForm, password: e.target.value })}
                        className="input-field pl-9 pr-10" placeholder="••••••••" />
                      <button type="button" onClick={() => setShowPass(v => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8896a4] hover:text-[#4a5568] transition-colors">
                        {showPass ? <RiEyeOffLine /> : <RiEyeLine />}
                      </button>
                    </div>
                  </div>
                  <button type="submit" disabled={loading} className="btn w-full justify-center py-3 text-[15px] mt-2">
                    {loading ? <div className="border-2 border-white/30 border-t-white rounded-full animate-spin w-4 h-4" /> : 'Sign in'}
                  </button>
                </form>

                <p className="text-center text-xs mt-6" style={{ color: isDark ? '#3d5448' : '#c8d0dc' }}>
                  Don't have credentials? Contact your CA.
                </p>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function SignUpForm({ loading, setLoading, navigate, isDark }) {
  const [form, setForm]         = useState({ name: '', email: '', password: '', phone: '' });
  const [showPass, setShowPass] = useState(false);
  const { register }            = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      await register(form);
      toast.success('Account created!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Sign up failed');
    } finally { setLoading(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {[
        { key: 'name',  label: 'Full name',     icon: RiUser3Line, type: 'text',  ph: 'Your name',       req: true },
        { key: 'email', label: 'Email address', icon: RiMailLine,  type: 'email', ph: 'you@example.com', req: true },
        { key: 'phone', label: 'Phone',         icon: RiPhoneLine, type: 'tel',   ph: '+91 XXXXX XXXXX', req: false },
      ].map(({ key, label, icon: Icon, type, ph, req }) => (
        <div key={key}>
          <label className="block text-xs font-semibold mb-1.5" style={{ color: isDark ? '#b0c0b8' : '#4a5568' }}>{label}</label>
          <div className="relative">
            <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8896a4] text-sm" />
            <input type={type} required={req} value={form[key]}
              onChange={e => setForm({ ...form, [key]: e.target.value })}
              className="input-field pl-9" placeholder={ph} />
          </div>
        </div>
      ))}
      <div>
        <label className="block text-xs font-semibold mb-1.5" style={{ color: isDark ? '#b0c0b8' : '#4a5568' }}>Password</label>
        <div className="relative">
          <RiLockLine className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8896a4] text-sm" />
          <input type={showPass ? 'text' : 'password'} required value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })}
            className="input-field pl-9 pr-10" placeholder="Min 6 characters" />
          <button type="button" onClick={() => setShowPass(v => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8896a4] hover:text-[#4a5568] transition-colors">
            {showPass ? <RiEyeOffLine /> : <RiEyeLine />}
          </button>
        </div>
      </div>
      <button type="submit" disabled={loading} className="btn w-full justify-center py-3 text-[15px] mt-2">
        {loading ? <div className="border-2 border-white/30 border-t-white rounded-full animate-spin w-4 h-4" /> : 'Create account'}
      </button>
      <p className="text-xs text-center" style={{ color: isDark ? '#6a8880' : '#8896a4' }}>
        Creating a new CA portal account. Staff and client accounts are added by the CA from inside the portal.
      </p>
    </form>
  );
}
