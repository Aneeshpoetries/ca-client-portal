import Sidebar from './Sidebar';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

export default function Layout({ children }) {
  const { isDark } = useTheme();

  return (
    <div
      className="min-h-screen relative overflow-x-hidden"
      style={{
        background: isDark
          ? `
            radial-gradient(ellipse 65% 55% at 0% 0%,   rgba(32,184,154,0.13) 0%, transparent 55%),
            radial-gradient(ellipse 55% 45% at 100% 0%, rgba(99,102,241,0.10) 0%, transparent 55%),
            radial-gradient(ellipse 45% 40% at 50% 100%,rgba(167,139,250,0.07) 0%, transparent 55%),
            linear-gradient(145deg, #07101a 0%, #0c0f20 45%, #060d0a 100%)
          `
          : `
            radial-gradient(ellipse 65% 55% at 0% 0%,   rgba(32,184,154,0.22) 0%, transparent 60%),
            radial-gradient(ellipse 55% 45% at 100% 0%, rgba(99,102,241,0.14) 0%, transparent 55%),
            radial-gradient(ellipse 45% 40% at 50% 100%,rgba(167,139,250,0.10) 0%, transparent 55%),
            linear-gradient(145deg, #edfaf6 0%, #f0f4ff 45%, #faf5ff 100%)
          `,
      }}
    >
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
