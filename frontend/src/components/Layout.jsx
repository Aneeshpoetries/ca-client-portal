import Sidebar from './Sidebar';
import ParticleField from './ParticleField';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

export default function Layout({ children }) {
  const { isDark } = useTheme();

  return (
    <div
      className="min-h-screen relative overflow-x-hidden"
      style={{
        background: isDark
          ? 'linear-gradient(145deg, #0e1410 0%, #111a16 40%, #0f1812 100%)'
          : 'linear-gradient(145deg, #f2efe9 0%, #f5f2eb 40%, #eff4f0 100%)',
      }}
    >
      <ParticleField count={200} dark={isDark} />
      <div className="relative z-10">
        <Sidebar />
        <motion.main
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          className="max-w-screen-xl mx-auto px-6 py-10"
        >
          {children}
        </motion.main>
      </div>
    </div>
  );
}
