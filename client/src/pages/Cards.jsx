import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { CreditCard } from 'lucide-react'
import api from '../services/api.js'
import { useToast } from '../context/ToastContext.jsx'
import { formatDateTime, maskAccount, maskCard } from '../utils/format.js'

export default function Cards() {
  const { push } = useToast()
  const [data, setData] = useState(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const { data: d } = await api.get('/api/account/details')
        if (!cancelled) setData(d)
      } catch {
        push('Could not load account details.', 'error')
      }
    })()
    return () => {
      cancelled = true
    }
  }, [push])

  if (!data) {
    return <p className="text-sm text-slate-500">Loading…</p>
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-slate-900">Cards & account</h1>
        <p className="mt-1 text-sm text-slate-600">Masked identifiers suitable for a secure overview screen.</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-900 via-brand-900 to-indigo-900 p-6 text-white shadow-glow"
      >
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-white/70">
            <CreditCard className="h-4 w-4" />
            Virtual debit
          </div>
          <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">Active</span>
        </div>
        <p className="mt-6 font-mono text-xl tracking-wide">{maskCard(data.account.cardNumber)}</p>
        <div className="mt-8 flex justify-between text-sm text-white/80">
          <span>{data.account.accountType}</span>
          <span>Member since {formatDateTime(data.memberSince)}</span>
        </div>
      </motion.div>

      <div className="grid gap-4 sm:grid-cols-2">
        {[
          ['Account number', maskAccount(data.account.accountNumber)],
          ['IFSC', data.account.ifscCode],
          ['Branch', data.account.branchName],
          ['Customer ID', data.customerId],
        ].map(([k, v]) => (
          <div key={k} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{k}</p>
            <p className="mt-2 text-sm font-semibold text-slate-900">{v}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
