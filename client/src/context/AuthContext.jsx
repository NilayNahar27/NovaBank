import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import api from '../services/api.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('nb_token'))
  const [me, setMe] = useState(null)
  const [loading, setLoading] = useState(!!localStorage.getItem('nb_token'))

  const loadMe = useCallback(async () => {
    const active = token || localStorage.getItem('nb_token')
    if (!active) {
      setMe(null)
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const { data } = await api.get('/api/auth/me')
      setMe(data)
    } catch {
      localStorage.removeItem('nb_token')
      setToken(null)
      setMe(null)
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    loadMe()
  }, [loadMe])

  const login = useCallback(
    async (cardNumber, pin) => {
      const { data } = await api.post('/api/auth/login', { cardNumber, pin })
      localStorage.setItem('nb_token', data.token)
      setToken(data.token)
      await loadMe()
      return data
    },
    [loadMe]
  )

  const loginWithEmail = useCallback(
    async (email, password) => {
      const { data } = await api.post('/api/auth/login', { email, password })
      localStorage.setItem('nb_token', data.token)
      setToken(data.token)
      await loadMe()
      return data
    },
    [loadMe]
  )

  const logout = useCallback(() => {
    localStorage.removeItem('nb_token')
    setToken(null)
    setMe(null)
  }, [])

  const bootstrapSession = useCallback(
    async (newToken) => {
      localStorage.setItem('nb_token', newToken)
      setToken(newToken)
      await loadMe()
    },
    [loadMe]
  )

  const value = useMemo(
    () => ({
      token,
      me,
      loading,
      isAuthenticated: !!token && !!me,
      login,
      loginWithEmail,
      logout,
      bootstrapSession,
      refreshMe: loadMe,
    }),
    [token, me, loading, login, loginWithEmail, logout, bootstrapSession, loadMe]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
