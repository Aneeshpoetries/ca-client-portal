import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { RiLockLine, RiEyeLine, RiEyeOffLine } from 'react-icons/ri';

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 6) return toast.error('Password must be at least 6 characters');
    if (password !== confirm) return toast.error('Passwords do not match');
    setLoading(true);
    try {
      await api.post(`/auth/reset-password/${token}`, { password });
      toast.success('Password reset! Please sign in.');
      setDone(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset failed — link may have expired');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-white">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="w-full max-w-sm"
      >
        <div className="flex items-center gap-2 mb-10">
          <div className="w-7 h-7 rounded-lg bg-gray-900 flex items-center justify-center">
            <span className="text-white text-xs font-bold">CA</span>
          </div>
          <span className="font-semibold text-gray-900">Portal</span>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-1">Set new password</h1>
        <p className="text-sm text-gray-400 mb-8">Choose a strong password for your account</p>

        {done ? (
          <div className="p-4 bg-green-50 border border-green-100 rounded-xl text-center">
            <p className="text-sm font-semibold text-green-800">Password updated!</p>
            <p className="text-xs text-green-700 mt-1">Redirecting to sign in…</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { label: 'New password', value: password, onChange: setPassword, ph: 'Min 6 characters' },
              { label: 'Confirm password', value: confirm, onChange: setConfirm, ph: 'Repeat new password' },
            ].map(({ label, value, onChange, ph }) => (
              <div key={label}>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">{label}</label>
                <div className="relative">
                  <RiLockLine className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                  <input
                    type={showPass ? 'text' : 'password'} required
                    value={value} onChange={e => onChange(e.target.value)}
                    className="input-field pl-9 pr-10" placeholder={ph}
                  />
                  <button type="button" onClick={() => setShowPass(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                    {showPass ? <RiEyeOffLine /> : <RiEyeLine />}
                  </button>
                </div>
              </div>
            ))}
            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-2.5 mt-2">
              {loading
                ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                : 'Reset password'}
            </button>
          </form>
        )}

        <p className="text-center text-sm text-gray-400 mt-6">
          <Link to="/login" className="text-indigo-600 hover:text-indigo-700 font-semibold transition-colors">
            Back to sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
