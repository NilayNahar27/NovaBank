import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Navbar, { UserBar } from '../components/Navbar.jsx'
import Sidebar from '../components/Sidebar.jsx'
import { useAuth } from '../context/AuthContext.jsx'

export default function DashboardLayout() {
  const { me, logout } = useAuth()
  const [open, setOpen] = useState(false)

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar
        showMenu
        onMenu={() => setOpen((v) => !v)}
        right={<UserBar name={me?.user?.fullName || 'Customer'} onLogout={logout} />}
      />
      <div className="mx-auto flex max-w-7xl gap-0 lg:gap-6 lg:px-6 lg:py-6">
        <div
          className={`${
            open ? 'translate-x-0' : '-translate-x-full'
          } fixed inset-y-0 left-0 top-0 z-50 w-72 border-r border-slate-200 bg-white pt-20 transition-transform lg:static lg:z-0 lg:w-64 lg:translate-x-0 lg:rounded-2xl lg:border lg:shadow-card lg:pt-0`}
        >
          <Sidebar onNavigate={() => setOpen(false)} />
        </div>
        {open && (
          <button
            type="button"
            className="fixed inset-0 z-40 bg-slate-900/40 lg:hidden"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
          />
        )}
        <main className="min-h-[calc(100vh-120px)] flex-1 px-4 py-6 sm:px-6 lg:px-2">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
