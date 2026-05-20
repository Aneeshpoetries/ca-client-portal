import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useGoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';
import {
  RiMailLine, RiLockLine, RiEyeLine, RiEyeOffLine,
  RiUser3Line, RiPhoneLine, RiCheckLine,
} from 'react-icons/ri';

// ── Sub-components (preserved) ────────────────────────────────────────────────
function GoogleButton({ onClick, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center justify-center gap-3 px-4 py-2.5 border border-[#e1e7ef] rounded-[10px] text-sm font-medium text-[#0d1117] hover:bg-[#f4f6fa] hover:border-[#c8d0dc] transition-all"
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

function Divider() {
  return (
    <div className="flex items-center gap-3 my-5">
      <div className="flex-1 h-px bg-[#e1e7ef]" />
      <span className="text-xs text-[#8896a4] font-medium">or</span>
      <div className="flex-1 h-px bg-[#e1e7ef]" />
    </div>
  );
}

// ── Login page ────────────────────────────────────────────────────────────────
export default function Login() {
  const [tab, setTab]               = useState('signin');
  const [signInForm, setSignInForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass]     = useState(false);
  const [loading, setLoading]       = useState(false);
  const { login, googleLogin }      = useAuth();
  const navigate                    = useNavigate();

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

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    try {
      const user = await googleLogin(credentialResponse.credential);
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

  const handleGoogleClick = () => triggerGoogle();

  const FEATURES = [
    'Multi-client document management',
    'GST returns & ITR filing tracker',
    'Staff access control',
    'Secure file storage',
  ];

  return (
    <div className="min-h-screen flex">

      {/* ── Left panel ──────────────────────────────────────────────────────── */}
      <div
        className="hidden lg:flex w-5/12 flex-col justify-between p-12 relative overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #0f172a 0%, #1e1b4b 100%)' }}
      >
        {/* Dot-grid SVG overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)`,
            backgroundSize: '20px 20px',
          }}
        />

        {/* Brand */}
        <div className="relative flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)' }}
          >
            <span className="text-white text-xs font-bold">CA</span>
          </div>
          <span className="text-white font-semibold tracking-tight">Portal</span>
        </div>

        {/* Headline + features */}
        <div className="relative">
          <h2
            className="text-white font-extrabold mb-4"
            style={{ fontSize: 32, lineHeight: 1.2, letterSpacing: '-0.02em' }}
          >
            Built for modern<br />CA practices.
          </h2>
          <p className="text-gray-400 text-sm leading-relaxed max-w-xs mb-10">
            Manage clients, documents, GST returns, and your team — all in one place.
          </p>
          <div className="space-y-3.5">
            {FEATURES.map(f => (
              <div key={f} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-md bg-indigo-500/20 flex items-center justify-center flex-shrink-0">
                  <RiCheckLine className="text-indigo-400 text-xs" />
                </div>
                <span className="text-sm text-gray-300">{f}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <p className="relative text-gray-600 text-xs">© 2025 CA Portal</p>
      </div>

      {/* ── Right panel ─────────────────────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="w-full max-w-sm"
        >
          {/* Mobile brand */}
          <div className="lg:hidden flex items-center gap-2 mb-10">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)' }}
            >
              <span className="text-white text-xs font-bold">CA</span>
            </div>
            <span className="font-semibold text-[#0d1117]">Portal</span>
          </div>

          {/* Tab toggle — pill style */}
          <div className="flex bg-[#f4f6fa] rounded-xl p-1 mb-8">
            {[
              { key: 'signin', label: 'Sign in' },
              { key: 'signup', label: 'Sign up' },
            ].map(t => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                  tab === t.key
                    ? 'bg-white text-[#0d1117] shadow-sm'
                    : 'text-[#8896a4] hover:text-[#4a5568]'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {tab === 'signin' ? (
              <motion.div
                key="signin"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 8 }}
                transition={{ duration: 0.18 }}
              >
                <GoogleButton onClick={handleGoogleClick} label="Continue with Google" />
                <Divider />

                <form onSubmit={handleSignIn} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#4a5568] mb-1.5">
                      Email address
                    </label>
                    <div className="relative">
                      <RiMailLine className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8896a4] text-sm" />
                      <input
                        type="email"
                        required
                        value={signInForm.email}
                        onChange={e => setSignInForm({ ...signInForm, email: e.target.value })}
                        className="input-field pl-9"
                        placeholder="you@example.com"
                        autoFocus
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-semibold text-[#4a5568]">
                        Password
                      </label>
                      <Link
                        to="/forgot-password"
                        className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
                      >
                        Forgot?
                      </Link>
                    </div>
                    <div className="relative">
                      <RiLockLine className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8896a4] text-sm" />
                      <input
                        type={showPass ? 'text' : 'password'}
                        required
                        value={signInForm.password}
                        onChange={e => setSignInForm({ ...signInForm, password: e.target.value })}
                        className="input-field pl-9 pr-10"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPass(v => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8896a4] hover:text-[#4a5568] transition-colors"
                      >
                        {showPass ? <RiEyeOffLine /> : <RiEyeLine />}
                      </button>
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn w-full justify-center py-3 text-[15px] mt-2"
                  >
                    {loading ? (
                      <div className="border-2 border-white/30 border-t-white rounded-full animate-spin w-4 h-4" />
                    ) : (
                      'Sign in'
                    )}
                  </button>
                </form>

                <p className="text-center text-xs text-[#c8d0dc] mt-6">
                  Contact your CA to get access.
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="signup"
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.18 }}
              >
                <GoogleButton onClick={handleGoogleClick} label="Sign up with Google" />
                <Divider />
                <SignUpForm loading={loading} setLoading={setLoading} navigate={navigate} />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}

// ── SignUpForm (logic preserved) ──────────────────────────────────────────────
function SignUpForm({ loading, setLoading, navigate }) {
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
          <label className="block text-xs font-semibold text-[#4a5568] mb-1.5">{label}</label>
          <div className="relative">
            <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8896a4] text-sm" />
            <input
              type={type}
              required={req}
              value={form[key]}
              onChange={e => setForm({ ...form, [key]: e.target.value })}
              className="input-field pl-9"
              placeholder={ph}
            />
          </div>
        </div>
      ))}
      <div>
        <label className="block text-xs font-semibold text-[#4a5568] mb-1.5">Password</label>
        <div className="relative">
          <RiLockLine className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8896a4] text-sm" />
          <input
            type={showPass ? 'text' : 'password'}
            required
            value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })}
            className="input-field pl-9 pr-10"
            placeholder="Min 6 characters"
          />
          <button
            type="button"
            onClick={() => setShowPass(v => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8896a4] hover:text-[#4a5568] transition-colors"
          >
            {showPass ? <RiEyeOffLine /> : <RiEyeLine />}
          </button>
        </div>
      </div>
      <button
        type="submit"
        disabled={loading}
        className="btn w-full justify-center py-3 text-[15px] mt-2"
      >
        {loading ? (
          <div className="border-2 border-white/30 border-t-white rounded-full animate-spin w-4 h-4" />
        ) : (
          'Create account'
        )}
      </button>
      <p className="text-xs text-[#8896a4] text-center">
        Creating a new CA portal account. Staff and client accounts are added by the CA from inside
        the portal.
      </p>
    </form>
  );
}
