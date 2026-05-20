import { motion } from 'framer-motion';

const colorMap = {
  primary: { bg: '#eef2ff', border: '#c7d2fe', text: '#6366f1', light: '#e0e7ff' },
  purple:  { bg: '#faf5ff', border: '#e9d5ff', text: '#a855f7', light: '#f3e8ff' },
  cyan:    { bg: '#ecfeff', border: '#a5f3fc', text: '#06b6d4', light: '#cffafe' },
  green:   { bg: '#f0fdf4', border: '#bbf7d0', text: '#16a34a', light: '#dcfce7' },
};

export default function StatsCard({ title, value, icon: Icon, color = 'primary', trend, delay = 0 }) {
  const c = colorMap[color] || colorMap.primary;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay }}
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      className="glass-card p-6 relative overflow-hidden"
      style={{ borderColor: c.border }}
    >
      <div
        className="absolute -top-6 -right-6 w-28 h-28 rounded-full opacity-40"
        style={{ background: `radial-gradient(circle, ${c.light}, transparent 70%)` }}
      />

      <div className="flex items-start justify-between relative z-10">
        <div>
          <p className="text-slate-500 text-sm font-medium mb-1.5">{title}</p>
          <motion.p
            className="text-3xl font-bold text-slate-900"
            initial={{ scale: 0.85 }}
            animate={{ scale: 1 }}
            transition={{ delay: delay + 0.15, type: 'spring', stiffness: 200 }}
          >
            {value}
          </motion.p>
          {trend && (
            <p className={`text-xs mt-2 font-medium ${trend.positive ? 'text-green-600' : 'text-red-500'}`}>
              {trend.positive ? '↑' : '↓'} {trend.text}
            </p>
          )}
        </div>

        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: c.bg, border: `1px solid ${c.border}` }}
        >
          <Icon style={{ color: c.text }} className="text-xl" />
        </div>
      </div>
    </motion.div>
  );
}
