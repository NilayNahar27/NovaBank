import { motion } from 'framer-motion'

export default function AmountCard({ label, amount, sub, onClick, selected }) {
  return (
    <motion.button
      type="button"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`w-full rounded-2xl border px-4 py-4 text-left shadow-sm transition ${
        selected
          ? 'border-brand-500 bg-brand-50 ring-2 ring-brand-500/30'
          : 'border-slate-200 bg-white hover:border-brand-300'
      }`}
    >
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 font-display text-xl font-semibold text-slate-900">{amount}</p>
      {sub && <p className="mt-1 text-xs text-slate-500">{sub}</p>}
    </motion.button>
  )
}
