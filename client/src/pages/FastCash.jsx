import { useState } from 'react'
import AmountCard from '../components/AmountCard.jsx'
import api from '../services/api.js'
import { useToast } from '../context/ToastContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { formatINR } from '../utils/format.js'

const PRESETS = [500, 1000, 2000, 5000]

export default function FastCash() {
  const { push } = useToast()
  const { refreshMe } = useAuth()
  const [selected, setSelected] = useState(2000)
  const [loading, setLoading] = useState(false)

  const dispense = async () => {
    setLoading(true)
    try {
      const { data } = await api.post('/api/transactions/fast-cash', { amount: selected })
      push(`${formatINR(selected)} dispensed. New balance ${formatINR(data.balance)}`)
      await refreshMe()
    } catch (e) {
      push(e?.response?.data?.error || 'Fast cash failed.', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-slate-900">Fast cash</h1>
        <p className="mt-1 text-sm text-slate-600">
          Preset amounts speed up common withdrawals while still enforcing ledger balance checks.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {PRESETS.map((amt) => (
          <AmountCard
            key={amt}
            label="Preset"
            amount={formatINR(amt)}
            sub="One tap withdrawal"
            selected={selected === amt}
            onClick={() => setSelected(amt)}
          />
        ))}
      </div>
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-card">
        <p className="text-sm text-slate-600">
          Selected amount: <span className="font-semibold text-slate-900">{formatINR(selected)}</span>
        </p>
        <button
          type="button"
          disabled={loading}
          onClick={dispense}
          className="mt-4 w-full rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 py-3 text-sm font-semibold text-white shadow-glow disabled:opacity-60"
        >
          {loading ? 'Dispensing…' : 'Dispense cash'}
        </button>
      </div>
    </div>
  )
}
