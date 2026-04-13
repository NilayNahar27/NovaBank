import { formatDateTime, formatINR } from '../utils/format.js'

export default function TransactionTable({ rows, variant = 'feed' }) {
  const showRunning = variant === 'statement'
  if (!rows?.length) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 px-6 py-12 text-center">
        <p className="text-sm font-medium text-slate-600">No transactions yet</p>
        <p className="mt-1 text-xs text-slate-500">Deposits and withdrawals will appear here.</p>
      </div>
    )
  }

  const sorted = [...rows].sort((a, b) => {
    const ta = new Date(a.created_at).getTime()
    const tb = new Date(b.created_at).getTime()
    return showRunning ? ta - tb : tb - ta
  })

  let running = 0

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">When</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Description</th>
              <th className="px-4 py-3 text-right">Amount</th>
              {showRunning && <th className="px-4 py-3 text-right">Running balance</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sorted.map((r) => {
              const delta = r.type === 'credit' ? Number(r.amount) : -Number(r.amount)
              if (showRunning) running += delta
              return (
                <tr key={r.id} className="hover:bg-slate-50/80">
                  <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                    {formatDateTime(r.created_at)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        r.type === 'credit'
                          ? 'bg-emerald-50 text-emerald-800'
                          : 'bg-rose-50 text-rose-800'
                      }`}
                    >
                      {r.type === 'credit' ? 'Credit' : 'Debit'}
                    </span>
                  </td>
                  <td className="max-w-[220px] truncate px-4 py-3 text-slate-700">
                    {r.description || '—'}
                  </td>
                  <td
                    className={`px-4 py-3 text-right font-semibold ${
                      r.type === 'credit' ? 'text-emerald-700' : 'text-rose-700'
                    }`}
                  >
                    {r.type === 'credit' ? '+' : '−'}
                    {formatINR(r.amount).replace('₹', '')}
                  </td>
                  {showRunning && (
                    <td className="px-4 py-3 text-right font-medium text-slate-800">
                      {formatINR(running)}
                    </td>
                  )}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
