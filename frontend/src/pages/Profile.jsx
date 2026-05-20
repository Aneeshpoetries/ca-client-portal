import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { RiUser3Line, RiMailLine, RiPhoneLine, RiLockLine, RiSaveLine } from 'react-icons/ri';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [profileForm, setProfileForm] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [passForm, setPassForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPass, setSavingPass] = useState(false);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const { data } = await api.put('/auth/profile', profileForm);
      updateUser(data.user);
      toast.success('Profile updated');
    } catch (err) { toast.error(err.response?.data?.message || 'Update failed'); }
    finally { setSavingProfile(false); }
  };

  const handlePassSave = async (e) => {
    e.preventDefault();
    if (passForm.newPassword !== passForm.confirmPassword) return toast.error('Passwords do not match');
    if (passForm.newPassword.length < 6) return toast.error('Password must be at least 6 characters');
    setSavingPass(true);
    try {
      await api.put('/auth/change-password', { currentPassword: passForm.currentPassword, newPassword: passForm.newPassword });
      setPassForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast.success('Password changed');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSavingPass(false); }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-8">

        
        <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="page-title">Profile</h1>
          <p className="text-sm text-gray-400 mt-1">Manage your account settings</p>
        </motion.div>

        
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.06 }}
          className="card px-6 py-5 flex items-center gap-4">
          <div className="avatar w-14 h-14 text-2xl flex-shrink-0">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-lg leading-tight">{user?.name}</p>
            <p className="text-sm text-gray-400">{user?.email}</p>
            <span className={`mt-2 inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-md ${
              user?.role === 'ca' ? 'bg-indigo-50 text-indigo-600' : 'bg-gray-100 text-gray-600'
            }`}>
              {user?.role === 'ca' ? 'Chartered Accountant' : 'Staff Member'}
            </span>
          </div>
        </motion.div>

        
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="card overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-900">Personal information</h2>
          </div>
          <form onSubmit={handleProfileSave} className="px-6 py-5 space-y-4">
            {[
              { key: 'name',  label: 'Full name',     icon: RiUser3Line,  type: 'text' },
              { key: 'phone', label: 'Phone number',  icon: RiPhoneLine,  type: 'tel' },
            ].map(({ key, label, icon: Icon, type }) => (
              <div key={key}>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">{label}</label>
                <div className="relative">
                  <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                  <input type={type} value={profileForm[key]}
                    onChange={e => setProfileForm({ ...profileForm, [key]: e.target.value })}
                    className="input-field pl-9" />
                </div>
              </div>
            ))}
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Email address</label>
              <div className="relative">
                <RiMailLine className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                <input type="email" value={user?.email || ''} disabled className="input-field pl-9 bg-gray-50 text-gray-400 cursor-not-allowed" />
              </div>
              <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
            </div>
            <div className="pt-2">
              <button type="submit" disabled={savingProfile} className="btn-primary">
                {savingProfile ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <><RiSaveLine /> Save changes</>}
              </button>
            </div>
          </form>
        </motion.div>

        
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.14 }} className="card overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-900">Change password</h2>
          </div>
          <form onSubmit={handlePassSave} className="px-6 py-5 space-y-4">
            {[
              { key: 'currentPassword', label: 'Current password',   ph: 'Enter current password' },
              { key: 'newPassword',     label: 'New password',        ph: 'Min 6 characters' },
              { key: 'confirmPassword', label: 'Confirm new password', ph: 'Repeat new password' },
            ].map(({ key, label, ph }) => (
              <div key={key}>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">{label}</label>
                <div className="relative">
                  <RiLockLine className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                  <input type="password" required value={passForm[key]}
                    onChange={e => setPassForm({ ...passForm, [key]: e.target.value })}
                    className="input-field pl-9" placeholder={ph} />
                </div>
              </div>
            ))}
            <div className="pt-2">
              <button type="submit" disabled={savingPass} className="btn-primary">
                {savingPass ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <><RiLockLine /> Update password</>}
              </button>
            </div>
          </form>
        </motion.div>

      </div>
    </Layout>
  );
}
