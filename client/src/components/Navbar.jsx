import { Link } from 'react-router-dom'
import { Building2, LogOut, Menu } from 'lucide-react'

export default function Navbar({ onMenu, showMenu = false, right = null }) {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          {showMenu && (
            <button
              type="button"
              onClick={onMenu}
              className="inline-flex rounded-xl border border-slate-200 bg-white p-2 text-slate-700 shadow-sm hover:bg-slate-50 lg:hidden"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          )}
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-600 to-indigo-700 text-white shadow-glow">
              <Building2 className="h-5 w-5" />
            </div>
            <div className="leading-tight">
              <p className="font-display text-sm font-semibold text-slate-900">NovaBank</p>
              <p className="text-[11px] font-medium text-slate-500">Net Banking</p>
            </div>
          </Link>
        </div>
        {right}
      </div>
    </header>
  )
}

export function UserBar({ name, onLogout }) {
  return (
    <div className="flex items-center gap-3">
      <div className="hidden text-right sm:block">
        <p className="text-xs text-slate-500">Signed in as</p>
        <p className="text-sm font-semibold text-slate-800">{name}</p>
      </div>
      <button
        type="button"
        onClick={onLogout}
        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
      >
        <LogOut className="h-4 w-4" />
        <span className="hidden sm:inline">Logout</span>
      </button>
    </div>
  )
}
