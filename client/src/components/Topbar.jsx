import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Bell, CheckCheck } from 'lucide-react'
import api from '../services/api.js'
import { formatDateTime } from '../utils/format.js'
import { useAuth } from '../context/AuthContext.jsx'

export default function Topbar() {
  const { refreshMe } = useAuth()
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const panelRef = useRef(null)

  const load = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/api/notifications?limit=30')
      setItems(data.notifications || [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (open) load()
  }, [open])

  useEffect(() => {
    const onDoc = (e) => {
      if (!panelRef.current) return
      if (!panelRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])

  const unread = items.filter((n) => !n.read_at).length

  const markOne = async (id) => {
    await api.patch(`/api/notifications/${id}/read`)
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read_at: new Date().toISOString() } : n)))
    await refreshMe()
  }

  const markAll = async () => {
    await api.patch('/api/notifications/read-all')
    await load()
    await refreshMe()
  }

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
      >
        <Bell className="h-4 w-4" />
        <span className="hidden sm:inline">Alerts</span>
        {unread > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-bold text-white">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 z-50 mt-2 w-[min(100vw-2rem,22rem)] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl"
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
              <p className="text-sm font-semibold text-slate-900">Notifications</p>
              <button
                type="button"
                onClick={markAll}
                className="inline-flex items-center gap-1 text-xs font-semibold text-brand-700 hover:underline"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                Mark all read
              </button>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {loading && (
                <p className="px-4 py-6 text-center text-xs text-slate-500">Loading…</p>
              )}
              {!loading && !items.length && (
                <p className="px-4 py-8 text-center text-sm text-slate-500">You are all caught up.</p>
              )}
              {!loading &&
                items.map((n) => (
                  <button
                    key={n.id}
                    type="button"
                    onClick={() => !n.read_at && markOne(n.id)}
                    className={`block w-full border-b border-slate-50 px-4 py-3 text-left transition hover:bg-slate-50 ${
                      n.read_at ? 'opacity-70' : ''
                    }`}
                  >
                    <p className="text-sm font-semibold text-slate-900">{n.title}</p>
                    <p className="mt-0.5 text-xs text-slate-600">{n.body}</p>
                    <p className="mt-1 text-[11px] text-slate-400">{formatDateTime(n.created_at)}</p>
                  </button>
                ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
