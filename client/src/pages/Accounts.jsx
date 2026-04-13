import { motion } from 'framer-motion'
import { Landmark, Shield } from 'lucide-react'
import { Link } from 'react-router-dom'
import StatCard from '../components/StatCard.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { formatINR, maskAccount, maskCard } from '../utils/format.js'

export default function Accounts() {
  const { me, loading } = useAuth()
  if (loading || !me) {
    return <p className="text-sm text-slate-500">Loading…</p>
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <h1 className="font-display text-2xl font-semibold text-slate-900">Accounts</h1>
        <p className="mt-1 text-sm text-slate-600">Primary savings relationship for this demo profile.</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl border border-slate-200 bg-white p-6 shadow-card"
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Primary account</p>
            <p className="mt-2 font-mono text-lg text-slate-900">{maskAccount(me.account.accountNumber)}</p>
            <p className="mt-1 text-sm text-slate-600">{me.account.accountType} · IFSC {me.account.ifscCode}</p>
            <p className="mt-1 text-xs text-slate-500">{me.account.branchName}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-500">Available balance</p>
            <p className="mt-1 font-display text-2xl font-semibold text-slate-900">{formatINR(me.balance)}</p>
            <Link to="/transactions" className="mt-2 inline-block text-xs font-semibold text-brand-700 hover:underline">
              View ledger
            </Link>
          </div>
        </div>
        <div className="mt-6 grid gap-4 border-t border-slate-100 pt-6 sm:grid-cols-2">
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-xs font-semibold text-slate-500">Virtual card</p>
            <p className="mt-2 font-mono text-sm text-slate-900">{maskCard(me.account.cardNumber)}</p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-xs font-semibold text-slate-500">Customer ID</p>
            <p className="mt-2 font-mono text-sm text-slate-900">{me.user.customerId}</p>
          </div>
        </div>
      </motion.div>

      <div className="grid gap-4 md:grid-cols-2">
        <StatCard title="Month credits" value={formatINR(me.monthlyCredits ?? 0)} icon={Landmark} accent="emerald" />
        <StatCard title="Month debits" value={formatINR(me.monthlyDebits ?? 0)} icon={Shield} accent="amber" />
      </div>
    </div>
  )
}
