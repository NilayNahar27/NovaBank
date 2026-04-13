import { useEffect, useMemo, useState } from 'react'
import { Printer } from 'lucide-react'
import TransactionTable from '../components/TransactionTable.jsx'
import api from '../services/api.js'
import { useToast } from '../context/ToastContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { formatINR } from '../utils/format.js'

export default function Statement() {
  const { push } = useToast()
  const { me } = useAuth()
  const [rows, setRows] = useState([])
  const [balance, setBalance] = useState(0)
  const [loading, setLoading] = useState(true)
  const [type, setType] = useState('all')
  const [category, setCategory] = useState('all')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')

  const query = useMemo(() => {
    const p = new URLSearchParams({ limit: '200', page: '1' })
    if (type === 'credit' || type === 'debit') p.set('type', type)
    if (category && category !== 'all') p.set('category', category)
    if (from) p.set('from', from)
    if (to) p.set('to', to)
    return p.toString()
  }, [type, category, from, to])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      try {
        const { data } = await api.get(`/api/transactions/history?${query}`)
        if (!cancelled) {
          setRows(data.transactions || [])
          setBalance(data.currentBalance ?? 0)
        }
      } catch {
        if (!cancelled) push('Could not load statement.', 'error')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [query, push])

  const printStatement = () => {
    window.print()
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-col justify-between gap-4 print:hidden sm:flex-row sm:items-end">
        <div>
          <h1 className="font-display text-2xl font-semibold text-slate-900">Account statement</h1>
          <p className="mt-1 text-sm text-slate-600">Filter activity, then print or save as PDF from the dialog.</p>
        </div>
        <button
          type="button"
          onClick={printStatement}
          disabled={!rows.length}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50 disabled:opacity-50"
        >
          <Printer className="h-4 w-4" />
          Download / Print
        </button>
      </div>

      <div className="flex flex-wrap gap-2 print:hidden">
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
        >
          <option value="all">All flows</option>
          <option value="credit">Credits</option>
          <option value="debit">Debits</option>
        </select>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
        >
          <option value="all">All categories</option>
          <option value="deposit">Deposit</option>
          <option value="withdrawal">Withdrawal</option>
          <option value="transfer">Transfer</option>
        </select>
        <input
          type="date"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
        />
        <input
          type="date"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
        />
      </div>

      <div id="statement-print" className="rounded-3xl border border-slate-200 bg-white p-5 shadow-card print:border-0 print:shadow-none">
        <div className="mb-6 hidden print:block">
          <p className="font-display text-xl font-semibold">NovaBank — Account statement</p>
          {me?.user && (
            <p className="mt-2 text-sm text-slate-700">
              {me.user.fullName} · Customer {me.user.customerId} · Account {me.account?.accountNumber}
            </p>
          )}
          <p className="mt-1 text-sm text-slate-600">Generated {new Date().toLocaleString('en-IN')}</p>
        </div>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-slate-600">
            Statement balance: <span className="font-semibold text-slate-900">{formatINR(balance)}</span>
          </p>
          {loading && <span className="text-xs font-semibold text-brand-700 print:hidden">Loading…</span>}
        </div>
        <TransactionTable rows={rows} variant="statement" showReceiptLink />
      </div>
    </div>
  )
}
