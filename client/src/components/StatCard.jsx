import { motion } from 'framer-motion'

export default function StatCard({ title, value, icon: Icon, accent = 'brand' }) {
  const accents = {
    brand: 'from-brand-600 to-indigo-600',
    emerald: 'from-emerald-600 to-teal-600',
    amber: 'from-amber-500 to-orange-600',
  }
  const grad = accents[accent] || accents.brand

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl bg-white p-5 shadow-card"
    >
      <div
        className={`pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br opacity-20 ${grad}`}
      />
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</p>
          <p className="mt-2 font-display text-2xl font-semibold text-slate-900">{value}</p>
        </div>
        {Icon && (
          <div className="rounded-xl bg-slate-100 p-2 text-slate-700">
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
    </motion.div>
  )
}
