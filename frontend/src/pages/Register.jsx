import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { RiMailLine, RiLockLine, RiUser3Line, RiPhoneLine, RiEyeLine, RiEyeOffLine, RiShieldKeyholeLine } from 'react-icons/ri';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', caCode: '' });
  const [showPass, setShowPass] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      await register(form);
      toast.success('Account created!');
      navigate('/dashboard');
    } catch (err) { toast.error(err.response?.data?.message || 'Registration failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex w-5/12 bg-gray-950 flex-col justify-between p-12">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center">
            <span className="text-gray-900 text-xs font-bold">CA</span>
          </div>
          <span className="text-white font-semibold">Portal</span>
        </div>
        <div>
          <h2 className="text-white text-3xl font-bold leading-snug mb-4">Join the platform<br />trusted by CAs.</h2>
          <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
            Create your account in seconds. CA registration code required for CA-level access.
          </p>
        </div>
        <p className="text-gray-600 text-xs">© 2025 CA Portal. All rights reserved.</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="w-full max-w-sm"
        >
          <div className="lg:hidden flex items-center gap-2 mb-10">
            <div className="w-7 h-7 rounded-lg bg-gray-900 flex items-center justify-center">
              <span className="text-white text-xs font-bold">CA</span>
            </div>
            <span className="font-semibold text-gray-900">Portal</span>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-1">Create account</h1>
          <p className="text-sm text-gray-400 mb-8">Fill in your details to get started</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { key: 'name',  label: 'Full name',     icon: RiUser3Line, type: 'text',  ph: 'Your full name',    req: true },
              { key: 'email', label: 'Email address', icon: RiMailLine,  type: 'email', ph: 'you@example.com',   req: true },
              { key: 'phone', label: 'Phone',         icon: RiPhoneLine, type: 'tel',   ph: '+91 XXXXX XXXXX',   req: false },
            ].map(({ key, label, icon: Icon, type, ph, req }) => (
              <div key={key}>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">{label}</label>
                <div className="relative">
                  <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                  <input type={type} required={req} value={form[key]}
                    onChange={e => setForm({ ...form, [key]: e.target.value })}
                    className="input-field pl-9" placeholder={ph} />
                </div>
              </div>
            ))}

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Password</label>
              <div className="relative">
                <RiLockLine className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                <input type={showPass ? 'text' : 'password'} required value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  className="input-field pl-9 pr-10" placeholder="Min 6 characters" />
                <button type="button" onClick={() => setShowPass(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                  {showPass ? <RiEyeOffLine /> : <RiEyeLine />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                CA code <span className="text-gray-300 font-normal">(leave empty for Staff account)</span>
              </label>
              <div className="relative">
                <RiShieldKeyholeLine className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                <input type={showCode ? 'text' : 'password'} value={form.caCode}
                  onChange={e => setForm({ ...form, caCode: e.target.value })}
                  className="input-field pl-9 pr-10" placeholder="CA access code" />
                <button type="button" onClick={() => setShowCode(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                  {showCode ? <RiEyeOffLine /> : <RiEyeLine />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-2.5 mt-2">
              {loading ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : 'Create account'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-400 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-600 hover:text-indigo-700 font-semibold transition-colors">Sign in</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
