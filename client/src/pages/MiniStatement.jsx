import { useEffect, useMemo, useState } from 'react'
import TransactionTable from '../components/TransactionTable.jsx'
import api from '../services/api.js'
import { useToast } from '../context/ToastContext.jsx'
import { formatINR } from '../utils/format.js'

export default function MiniStatement() {
  const { push } = useToast()
  const [rows, setRows] = useState([])
  const [balance, setBalance] = useState(0)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  const query = useMemo(() => {
    const params = new URLSearchParams({ limit: '80' })
    if (filter === 'credit' || filter === 'debit') params.set('type', filter)
    return params.toString()
  }, [filter])

  const load = async () => {
    setLoading(true)
    try {
      const { data } = await api.get(`/api/transactions/history?${query}`)
      setRows(data.transactions)
      setBalance(data.currentBalance)
    } catch {
      push('Could not load transactions.', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reload when filters change
  }, [query])

  const downloadCsv = () => {
    const header = ['Date', 'Type', 'Amount', 'Description']
    const lines = [...rows]
      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
      .map((r) => [
        new Date(r.created_at).toISOString(),
        r.type,
        r.amount,
        `"${String(r.description || '').replace(/"/g, '""')}"`,
      ])
    const csv = [header.join(','), ...lines.map((l) => l.join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'novabank-mini-statement.csv'
    a.click()
    URL.revokeObjectURL(url)
    push('CSV downloaded.')
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="font-display text-2xl font-semibold text-slate-900">Mini statement</h1>
          <p className="mt-1 text-sm text-slate-600">
            Filter by transaction type or export a lightweight CSV for your records.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-800 shadow-sm"
          >
            <option value="all">All activity</option>
            <option value="credit">Credits only</option>
            <option value="debit">Debits only</option>
          </select>
          <button
            type="button"
            onClick={downloadCsv}
            disabled={!rows.length}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50 disabled:opacity-50"
          >
            Download CSV
          </button>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-card">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-slate-600">
            Current ledger balance:{' '}
            <span className="font-semibold text-slate-900">{formatINR(balance)}</span>
          </p>
          {loading && <span className="text-xs font-semibold text-brand-700">Loading…</span>}
        </div>
        <TransactionTable rows={rows} variant="statement" />
      </div>
    </div>
  )
}
