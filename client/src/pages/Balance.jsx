import { useEffect, useState } from 'react'
import { Landmark, RefreshCw } from 'lucide-react'
import api from '../services/api.js'
import { formatINR, maskCard } from '../utils/format.js'
import { useAuth } from '../context/AuthContext.jsx'
import { SkeletonLine } from '../components/Skeleton.jsx'

export default function Balance() {
  const { me, refreshMe } = useAuth()
  const [balance, setBalance] = useState(null)
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/api/account/balance')
      setBalance(data.balance)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-slate-900">Balance enquiry</h1>
          <p className="mt-1 text-sm text-slate-600">
            Balance is computed from credits minus debits — always consistent with your mini statement.
          </p>
        </div>
        <button
          type="button"
          onClick={async () => {
            await load()
            await refreshMe()
          }}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>
      <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-brand-900 p-8 text-white shadow-glow">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        <div className="relative flex items-center gap-3 text-sm text-slate-200">
          <Landmark className="h-5 w-5" />
          <span>Primary account</span>
        </div>
        <p className="relative mt-6 font-mono text-sm text-slate-200">{maskCard(me?.account?.cardNumber)}</p>
        <p className="relative mt-6 text-xs font-semibold uppercase tracking-wide text-slate-300">
          Available balance
        </p>
        {loading ? (
          <SkeletonLine className="relative mt-3 h-10 w-48 bg-white/20" />
        ) : (
          <p className="relative mt-2 font-display text-4xl font-semibold">{formatINR(balance)}</p>
        )}
      </div>
    </div>
  )
}
