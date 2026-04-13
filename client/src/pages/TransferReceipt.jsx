import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Printer } from 'lucide-react'
import api from '../services/api.js'
import { useToast } from '../context/ToastContext.jsx'
import { formatDateTime, formatINR } from '../utils/format.js'

export default function TransferReceipt() {
  const { id } = useParams()
  const { push } = useToast()
  const [t, setT] = useState(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const { data } = await api.get(`/api/transfers/${id}`)
        if (!cancelled) setT(data.transfer)
      } catch {
        if (!cancelled) push('Receipt not found.', 'error')
      }
    })()
    return () => {
      cancelled = true
    }
  }, [id, push])

  if (!t) {
    return <p className="text-sm text-slate-500">Loading receipt…</p>
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div className="flex items-center justify-between print:hidden">
        <Link to="/transactions" className="text-sm font-semibold text-brand-700 hover:underline">
          ← Back to transactions
        </Link>
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold shadow-sm hover:bg-slate-50"
        >
          <Printer className="h-4 w-4" />
          Print
        </button>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-card print:shadow-none">
        <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">NovaBank</p>
        <p className="mt-2 text-center font-display text-xl font-semibold text-slate-900">Transfer receipt</p>
        <p className="mt-6 text-center text-3xl font-bold text-slate-900">{formatINR(t.amount)}</p>
        <p className="mt-2 text-center text-sm text-slate-600">Status: {t.status}</p>

        <dl className="mt-8 space-y-3 text-sm">
          <div className="flex justify-between gap-4 border-b border-slate-100 py-2">
            <dt className="text-slate-500">Reference</dt>
            <dd className="font-mono font-semibold text-slate-900">{t.reference_number}</dd>
          </div>
          <div className="flex justify-between gap-4 border-b border-slate-100 py-2">
            <dt className="text-slate-500">From account</dt>
            <dd className="text-right font-mono text-slate-900">{t.from_account_number}</dd>
          </div>
          <div className="flex justify-between gap-4 border-b border-slate-100 py-2">
            <dt className="text-slate-500">IFSC</dt>
            <dd className="font-mono text-slate-900">{t.from_ifsc_code}</dd>
          </div>
          <div className="flex justify-between gap-4 border-b border-slate-100 py-2">
            <dt className="text-slate-500">Beneficiary</dt>
            <dd className="text-right text-slate-900">{t.beneficiary_name}</dd>
          </div>
          <div className="flex justify-between gap-4 border-b border-slate-100 py-2">
            <dt className="text-slate-500">To account</dt>
            <dd className="text-right font-mono text-slate-900">{t.to_account_number}</dd>
          </div>
          <div className="flex justify-between gap-4 border-b border-slate-100 py-2">
            <dt className="text-slate-500">Bank / IFSC</dt>
            <dd className="text-right text-slate-900">
              {t.to_bank_name} · {t.to_ifsc_code}
            </dd>
          </div>
          <div className="flex justify-between gap-4 border-b border-slate-100 py-2">
            <dt className="text-slate-500">When</dt>
            <dd className="text-slate-900">{formatDateTime(t.created_at)}</dd>
          </div>
          <div className="flex justify-between gap-4 py-2">
            <dt className="text-slate-500">Remarks</dt>
            <dd className="max-w-[60%] text-right text-slate-900">{t.remarks || '—'}</dd>
          </div>
        </dl>

        <p className="mt-8 text-center text-[11px] text-slate-400">
          This is a simulated receipt for portfolio / interview use only.
        </p>
      </div>
    </div>
  )
}
