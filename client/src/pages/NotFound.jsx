import { Link } from 'react-router-dom'
import { Home, LogIn } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 text-center">
      <p className="font-display text-7xl font-bold text-brand-700">404</p>
      <h1 className="mt-4 text-2xl font-semibold text-slate-900">This screen is not on our map</h1>
      <p className="mt-2 max-w-md text-sm text-slate-600">
        The route you requested does not exist. Head back to NovaBank home or sign in to continue your session.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-glow"
        >
          <Home className="h-4 w-4" />
          Home
        </Link>
        <Link
          to="/login"
          className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-800 shadow-sm"
        >
          <LogIn className="h-4 w-4" />
          Login
        </Link>
      </div>
    </div>
  )
}
