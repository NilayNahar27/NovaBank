import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowDownLeft,
  ArrowUpRight,
  Banknote,
  FileText,
  Landmark,
  Lock,
  Sparkles,
  Zap,
} from 'lucide-react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts'
import StatCard from '../components/StatCard.jsx'
import TransactionTable from '../components/TransactionTable.jsx'
import { DashboardSkeleton } from '../components/Skeleton.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { formatINR, maskCard } from '../utils/format.js'

const quick = [
  { to: '/app/deposit', label: 'Deposit', icon: ArrowDownLeft, color: 'from-emerald-600 to-teal-600' },
  { to: '/app/withdraw', label: 'Withdraw', icon: ArrowUpRight, color: 'from-rose-600 to-orange-600' },
  { to: '/app/fast-cash', label: 'Fast cash', icon: Zap, color: 'from-amber-500 to-orange-600' },
  { to: '/app/mini-statement', label: 'Mini statement', icon: FileText, color: 'from-brand-600 to-indigo-600' },
]

export default function Dashboard() {
  const { me, loading } = useAuth()

  if (loading || !me) {
    return (
      <div className="mx-auto max-w-5xl">
        <DashboardSkeleton />
      </div>
    )
  }

  const chartData =
    me.chart?.map((d) => ({
      day: new Date(d.date).toLocaleDateString('en-IN', { weekday: 'short' }),
      credits: d.credits,
      debits: d.debits,
    })) || []

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-brand-700 via-indigo-700 to-slate-900 p-6 text-white shadow-glow sm:p-8"
      >
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold">
              <Sparkles className="h-3.5 w-3.5" />
              Welcome back
            </p>
            <h1 className="mt-3 font-display text-3xl font-semibold sm:text-4xl">
              {(me.user.fullName || 'Customer').split(' ')[0]}&rsquo;s workspace
            </h1>
            <p className="mt-2 max-w-xl text-sm text-blue-100/90">
              Balances are derived from your transaction ledger — every credit and debit is auditable.
            </p>
            <div className="mt-6 flex flex-wrap gap-3 text-sm">
              <span className="rounded-xl bg-white/10 px-3 py-1 font-mono text-xs sm:text-sm">
                {maskCard(me.account.cardNumber)}
              </span>
              <span className="rounded-xl bg-white/10 px-3 py-1 text-xs font-semibold sm:text-sm">
                {me.account.accountType} · {me.account.accountNumber}
              </span>
            </div>
          </div>
          <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-100">Available balance</p>
            <p className="mt-1 font-display text-3xl font-semibold">{formatINR(me.balance)}</p>
            <Link
              to="/app/balance"
              className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-white/90 hover:underline"
            >
              <Landmark className="h-4 w-4" />
              View balance screen
            </Link>
          </div>
        </div>
      </motion.div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard title="Cash position" value={formatINR(me.balance)} icon={Banknote} accent="brand" />
        <StatCard
          title="Recent credits"
          value={formatINR(
            me.recentTransactions?.filter((t) => t.type === 'credit').reduce((s, t) => s + Number(t.amount), 0) || 0
          )}
          icon={ArrowDownLeft}
          accent="emerald"
        />
        <StatCard
          title="Recent debits"
          value={formatINR(
            me.recentTransactions?.filter((t) => t.type === 'debit').reduce((s, t) => s + Number(t.amount), 0) || 0
          )}
          icon={ArrowUpRight}
          accent="amber"
        />
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="font-display text-lg font-semibold text-slate-900">Quick actions</h2>
          <Link to="/app/change-pin" className="text-sm font-semibold text-brand-700 hover:underline">
            <span className="inline-flex items-center gap-1">
              <Lock className="h-4 w-4" />
              Change PIN
            </span>
          </Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {quick.map(({ to, label, icon: Icon, color }) => (
            <Link
              key={to}
              to={to}
              className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-card transition hover:-translate-y-0.5"
            >
              <div
                className={`absolute -right-6 -top-6 h-20 w-20 rounded-full bg-gradient-to-br opacity-20 ${color}`}
              />
              <Icon className="h-5 w-5 text-slate-800" />
              <p className="mt-3 text-sm font-semibold text-slate-900">{label}</p>
              <p className="mt-1 text-xs text-slate-500">Secure · validated server-side</p>
            </Link>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-card lg:col-span-2">
          <h3 className="font-display text-base font-semibold text-slate-900">7-day cashflow</h3>
          <p className="mt-1 text-xs text-slate-500">Credits vs debits by calendar day.</p>
          <div className="mt-4 h-56">
            {chartData.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="day" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                  <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
                  <Tooltip
                    formatter={(v) => formatINR(v)}
                    contentStyle={{ borderRadius: 12, borderColor: '#e2e8f0' }}
                  />
                  <Bar dataKey="credits" fill="#10b981" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="debits" fill="#f43f5e" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-slate-500">
                Chart appears after a few days of activity.
              </div>
            )}
          </div>
        </div>
        <div className="lg:col-span-3">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-display text-base font-semibold text-slate-900">Recent transactions</h3>
            <Link to="/app/mini-statement" className="text-sm font-semibold text-brand-700 hover:underline">
              View all
            </Link>
          </div>
          <TransactionTable rows={me.recentTransactions} />
        </div>
      </div>
    </div>
  )
}
