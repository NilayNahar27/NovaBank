import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, ShieldCheck, Sparkles, Wallet } from 'lucide-react'
import Navbar from '../components/Navbar.jsx'

export default function Landing() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main>
        <section className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(37,99,235,0.18),transparent_42%),radial-gradient(circle_at_80%_0%,rgba(99,102,241,0.16),transparent_38%)]" />
          <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:items-center lg:py-24 lg:px-8">
            <div>
              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="font-display text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl"
              >
                NovaBank Net Banking
              </motion.h1>
              <p className="mt-4 max-w-xl text-lg leading-relaxed text-slate-600">
                A polished digital banking workspace: transfers, beneficiaries, statements, alerts, and a
                ledger-backed balance — powered by Express, MySQL, and a modern React dashboard.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  to="/signup"
                  className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-glow transition hover:brightness-110"
                >
                  Open an account
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50"
                >
                  Sign in
                </Link>
              </div>
              <div className="mt-10 grid gap-4 sm:grid-cols-3">
                {[
                  { t: 'Ledger balances', d: 'Credits, debits, transfers — auditable.', icon: Wallet },
                  { t: 'Secure by design', d: 'Hashed secrets + JWT sessions.', icon: ShieldCheck },
                  { t: 'Premium UX', d: 'Banking patterns that feel real.', icon: Sparkles },
                ].map(({ t, d, icon: Icon }) => (
                  <div key={t} className="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm">
                    <Icon className="h-5 w-5 text-brand-600" />
                    <p className="mt-2 text-sm font-semibold text-slate-900">{t}</p>
                    <p className="mt-1 text-xs text-slate-600">{d}</p>
                  </div>
                ))}
              </div>
            </div>
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="relative"
            >
              <div className="absolute -inset-6 rounded-[2rem] bg-gradient-to-br from-brand-500/20 via-indigo-500/10 to-transparent blur-2xl" />
              <div className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-6 shadow-card sm:p-8">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Primary account
                    </p>
                    <p className="mt-2 font-mono text-lg text-slate-900">•••• •••• •••• 0366</p>
                  </div>
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
                    Active
                  </span>
                </div>
                <div className="mt-8 grid grid-cols-2 gap-4">
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-xs text-slate-500">Available balance</p>
                    <p className="mt-1 font-display text-2xl font-semibold text-slate-900">₹2,58,850</p>
                  </div>
                  <div className="rounded-2xl bg-brand-50 p-4">
                    <p className="text-xs text-brand-800">Last transfer</p>
                    <p className="mt-1 text-sm font-semibold text-brand-900">IMPS · ₹18,500</p>
                  </div>
                </div>
                <div className="mt-8 grid grid-cols-3 gap-3">
                  {['Transfer', 'Beneficiaries', 'Statement'].map((a) => (
                    <div
                      key={a}
                      className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-center text-xs font-semibold text-slate-700"
                    >
                      {a}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
    </div>
  )
}
