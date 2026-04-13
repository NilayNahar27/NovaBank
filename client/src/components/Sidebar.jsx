import { NavLink } from 'react-router-dom'
import {
  ArrowDownLeft,
  ArrowUpRight,
  CreditCard,
  FileText,
  Gauge,
  Landmark,
  ListOrdered,
  Lock,
  Send,
  Settings,
  Shield,
  Users,
  Wallet,
  Zap,
} from 'lucide-react'

const links = [
  { to: '/dashboard', end: true, label: 'Dashboard', icon: Gauge },
  { to: '/accounts', label: 'Accounts', icon: Wallet },
  { to: '/transfer', label: 'Transfer', icon: Send },
  { to: '/beneficiaries', label: 'Beneficiaries', icon: Users },
  { to: '/transactions', label: 'Transactions', icon: ListOrdered },
  { to: '/statement', label: 'Mini Statement', icon: FileText },
  { to: '/deposit', label: 'Add Funds', icon: ArrowDownLeft },
  { to: '/withdraw', label: 'Withdraw', icon: ArrowUpRight },
  { to: '/fast-cash', label: 'Fast Cash', icon: Zap },
  { to: '/balance', label: 'Balance', icon: Landmark },
  { to: '/cards', label: 'Cards', icon: CreditCard },
  { to: '/profile', label: 'Profile', icon: Settings },
  { to: '/security', label: 'Security', icon: Shield },
  { to: '/change-pin', label: 'Change PIN', icon: Lock },
]

export default function Sidebar({ onNavigate }) {
  return (
    <aside className="flex h-full flex-col border-r border-slate-200 bg-white">
      <div className="border-b border-slate-100 px-5 py-4">
        <div className="flex items-center gap-2 text-slate-800">
          <Wallet className="h-5 w-5 text-brand-600" />
          <p className="font-display text-sm font-semibold">NovaBank Online</p>
        </div>
        <p className="mt-1 text-xs text-slate-500">Secure banking in demo mode.</p>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {links.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                isActive
                  ? 'bg-brand-50 text-brand-800 ring-1 ring-brand-200'
                  : 'text-slate-600 hover:bg-slate-50'
              }`
            }
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-slate-100 p-4 text-xs text-slate-500">
        Funds and transfers are simulated for portfolio demos.
      </div>
    </aside>
  )
}
