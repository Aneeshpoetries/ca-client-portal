import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { RiMailLine, RiArrowLeftLine } from 'react-icons/ri';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetUrl, setResetUrl] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/forgot-password', { email });
      toast.success('Reset link generated!');
      if (data.resetUrl) setResetUrl(data.resetUrl);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
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

        <h1 className="text-2xl font-bold text-gray-900 mb-1">Forgot password</h1>
        <p className="text-sm text-gray-400 mb-8">Enter your email and we'll generate a reset link</p>

        {!resetUrl ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Email address</label>
              <div className="relative">
                <RiMailLine className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                <input
                  type="email" required value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="input-field pl-9" placeholder="you@example.com" autoFocus
                />
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-2.5 mt-2">
              {loading
                ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                : 'Send reset link'}
            </button>
          </form>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="p-4 bg-green-50 border border-green-100 rounded-xl">
              <p className="text-sm font-semibold text-green-800 mb-1">Reset link ready</p>
              <p className="text-xs text-green-700 mb-3">Click the link below to reset your password. It expires in 15 minutes.</p>
              <a
                href={resetUrl}
                className="block text-xs text-indigo-600 font-medium break-all hover:underline"
              >
                {resetUrl}
              </a>
            </div>
            <a href={resetUrl} className="btn-primary w-full justify-center py-2.5 block text-center">
              Go to reset page
            </a>
          </motion.div>
        )}

        <p className="text-center text-sm text-gray-400 mt-6">
          <Link to="/login" className="inline-flex items-center gap-1 text-gray-500 hover:text-gray-700 font-medium transition-colors">
            <RiArrowLeftLine /> Back to sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
