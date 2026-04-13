import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Building2 } from 'lucide-react'

export default function AuthLayout({ children, title, subtitle }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(37,99,235,0.14),transparent_45%),radial-gradient(circle_at_bottom,_rgba(99,102,241,0.12),transparent_40%)]" />
      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col px-4 py-10 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:gap-12 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 max-w-xl lg:mb-0"
        >
          <Link to="/" className="inline-flex items-center gap-2 text-slate-900">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-600 to-indigo-700 text-white shadow-glow">
              <Building2 className="h-5 w-5" />
            </span>
            <span className="font-display text-lg font-semibold">NovaBank</span>
          </Link>
          <h1 className="mt-8 font-display text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            {title}
          </h1>
          <p className="mt-3 text-base leading-relaxed text-slate-600">{subtitle}</p>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {['Ledger-backed balances', 'JWT-secured sessions', 'Hashed PIN storage', 'Input validation'].map(
              (t) => (
                <div
                  key={t}
                  className="rounded-2xl border border-slate-200/80 bg-white/70 px-4 py-3 text-sm font-medium text-slate-700 shadow-sm"
                >
                  {t}
                </div>
              )
            )}
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="w-full max-w-lg rounded-3xl border border-slate-200/80 bg-white/90 p-6 shadow-card backdrop-blur lg:p-8"
        >
          {children}
        </motion.div>
      </div>
    </div>
  )
}
