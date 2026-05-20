import Sidebar from './Sidebar';
import { motion } from 'framer-motion';

export default function Layout({ children }) {
  return (
    <div className="min-h-screen" style={{ background: '#f7f9fc' }}>
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
  );
}
