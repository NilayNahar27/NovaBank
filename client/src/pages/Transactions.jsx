import { useEffect, useMemo, useState } from 'react'
import TransactionTable from '../components/TransactionTable.jsx'
import api from '../services/api.js'
import { useToast } from '../context/ToastContext.jsx'
import { formatINR } from '../utils/format.js'

export default function Transactions() {
  const { push } = useToast()
  const [rows, setRows] = useState([])
  const [balance, setBalance] = useState(0)
  const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0, totalPages: 1 })
  const [loading, setLoading] = useState(true)
  const [type, setType] = useState('all')
  const [category, setCategory] = useState('all')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [q, setQ] = useState('')

  const query = useMemo(() => {
    const p = new URLSearchParams()
    p.set('page', String(pagination.page))
    p.set('limit', String(pagination.limit))
    if (type === 'credit' || type === 'debit') p.set('type', type)
    if (category && category !== 'all') p.set('category', category)
    if (from) p.set('from', from)
    if (to) p.set('to', to)
    if (q.trim()) p.set('q', q.trim())
    return p.toString()
  }, [pagination.page, pagination.limit, type, category, from, to, q])

  const load = async () => {
    setLoading(true)
    try {
      const { data } = await api.get(`/api/transactions/history?${query}`)
      setRows(data.transactions || [])
      setBalance(data.currentBalance ?? 0)
      if (data.pagination) {
        setPagination((prev) => ({
          ...prev,
          page: data.pagination.page,
          limit: data.pagination.limit,
          total: data.pagination.total,
          totalPages: data.pagination.totalPages,
        }))
      }
    } catch {
      push('Could not load transactions.', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query])

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="font-display text-2xl font-semibold text-slate-900">Transactions</h1>
          <p className="mt-1 text-sm text-slate-600">Search and filter your ledger with pagination.</p>
        </div>
        <p className="text-sm text-slate-600">
          Balance <span className="font-semibold text-slate-900">{formatINR(balance)}</span>
        </p>
      </div>

      <div className="flex flex-wrap gap-2 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
        <input
          type="search"
          placeholder="Search description / ref…"
          value={q}
          onChange={(e) => {
            setQ(e.target.value)
            setPagination((p) => ({ ...p, page: 1 }))
          }}
          className="min-w-[180px] flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-500"
        />
        <select
          value={type}
          onChange={(e) => {
            setType(e.target.value)
            setPagination((p) => ({ ...p, page: 1 }))
          }}
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
        >
          <option value="all">All flows</option>
          <option value="credit">Credits</option>
          <option value="debit">Debits</option>
        </select>
        <select
          value={category}
          onChange={(e) => {
            setCategory(e.target.value)
            setPagination((p) => ({ ...p, page: 1 }))
          }}
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
        >
          <option value="all">All categories</option>
          <option value="deposit">Deposit</option>
          <option value="withdrawal">Withdrawal</option>
          <option value="transfer">Transfer</option>
          <option value="general">General</option>
        </select>
        <input
          type="date"
          value={from}
          onChange={(e) => {
            setFrom(e.target.value)
            setPagination((p) => ({ ...p, page: 1 }))
          }}
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
        />
        <input
          type="date"
          value={to}
          onChange={(e) => {
            setTo(e.target.value)
            setPagination((p) => ({ ...p, page: 1 }))
          }}
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
        />
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-card">
        {loading && <p className="text-xs font-semibold text-brand-700">Loading…</p>}
        <TransactionTable rows={rows} showReceiptLink />
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4 text-sm">
          <p className="text-slate-500">
            Page {pagination.page} of {pagination.totalPages} · {pagination.total} rows
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={pagination.page <= 1}
              onClick={() => setPagination((p) => ({ ...p, page: Math.max(1, p.page - 1) }))}
              className="rounded-xl border border-slate-200 px-3 py-1.5 text-sm font-semibold disabled:opacity-40"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => setPagination((p) => ({ ...p, page: p.page + 1 }))}
              className="rounded-xl border border-slate-200 px-3 py-1.5 text-sm font-semibold disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
