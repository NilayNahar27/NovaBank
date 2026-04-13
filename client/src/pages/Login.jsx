import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import AuthLayout from '../layouts/AuthLayout.jsx'
import FormInput from '../components/FormInput.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { getSavedCardNumber, clearSavedCardNumber } from '../utils/cardStorage.js'
import { formatCardGroups } from '../utils/format.js'

export default function Login() {
  const { login, loginWithEmail } = useAuth()
  const { push } = useToast()
  const nav = useNavigate()
  const loc = useLocation()
  const from = loc.state?.from || '/dashboard'
  const [mode, setMode] = useState('net')
  const [hasSavedCard, setHasSavedCard] = useState(() => !!getSavedCardNumber())

  const cardForm = useForm({ defaultValues: { cardNumber: '', pin: '' } })
  const netForm = useForm({ defaultValues: { email: '', password: '' } })

  useEffect(() => {
    const saved = getSavedCardNumber()
    if (saved) {
      cardForm.reset({ cardNumber: formatCardGroups(saved), pin: '' })
      setHasSavedCard(true)
    }
  }, [cardForm])

  const onNetSubmit = netForm.handleSubmit(async (values) => {
    try {
      await loginWithEmail(values.email.trim(), values.password)
      push('Welcome back — your session is secured with JWT.')
      nav(from, { replace: true })
    } catch (e) {
      push(e?.response?.data?.error || 'Unable to sign in. Check your details.', 'error')
    }
  })

  const onCardSubmit = cardForm.handleSubmit(async (values) => {
    try {
      const card = String(values.cardNumber).replace(/\s/g, '')
      await login(card, values.pin)
      push('Welcome back — session secured.')
      nav(from, { replace: true })
    } catch (e) {
      push(e?.response?.data?.error || 'Unable to sign in. Check your details.', 'error')
    }
  })

  return (
    <AuthLayout
      title="Sign in to NovaBank"
      subtitle="Use your net banking credentials, or sign in with your virtual card and ATM PIN — the same secure backend validates both paths."
    >
      <div className="mb-6 flex rounded-2xl border border-slate-200 bg-slate-50 p-1 text-sm font-semibold">
        <button
          type="button"
          onClick={() => setMode('net')}
          className={`flex-1 rounded-xl py-2 transition ${
            mode === 'net' ? 'bg-white text-brand-800 shadow-sm' : 'text-slate-600'
          }`}
        >
          Net banking
        </button>
        <button
          type="button"
          onClick={() => setMode('card')}
          className={`flex-1 rounded-xl py-2 transition ${
            mode === 'card' ? 'bg-white text-brand-800 shadow-sm' : 'text-slate-600'
          }`}
        >
          Card & PIN
        </button>
      </div>

      {mode === 'net' ? (
        <form onSubmit={onNetSubmit} className="space-y-4">
          <FormInput
            label="Email"
            type="email"
            autoComplete="username"
            error={netForm.formState.errors.email?.message}
            {...netForm.register('email', { required: 'Email is required' })}
          />
          <FormInput
            label="Password"
            type="password"
            autoComplete="current-password"
            error={netForm.formState.errors.password?.message}
            {...netForm.register('password', { required: 'Password is required' })}
          />
          <button
            type="submit"
            disabled={netForm.formState.isSubmitting}
            className="mt-2 w-full rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 py-3 text-sm font-semibold text-white shadow-glow transition enabled:hover:brightness-110 disabled:opacity-60"
          >
            {netForm.formState.isSubmitting ? 'Signing in…' : 'Secure login'}
          </button>
        </form>
      ) : (
        <form onSubmit={onCardSubmit} className="space-y-4">
          <FormInput
            label="Card number"
            placeholder="4532 0151 1283 0366"
            inputMode="numeric"
            autoComplete="off"
            error={cardForm.formState.errors.cardNumber?.message}
            {...cardForm.register('cardNumber', {
              required: 'Card number is required',
              minLength: { value: 14, message: 'Enter a valid card number' },
            })}
          />
          {hasSavedCard && (
            <button
              type="button"
              onClick={() => {
                clearSavedCardNumber()
                setHasSavedCard(false)
                cardForm.reset({ cardNumber: '', pin: '' })
                push('Saved card cleared from this browser.')
              }}
              className="-mt-1 text-left text-xs font-medium text-slate-500 underline-offset-2 hover:text-brand-700 hover:underline"
            >
              Clear remembered card from this device
            </button>
          )}
          <FormInput
            label="PIN"
            type="password"
            inputMode="numeric"
            autoComplete="off"
            error={cardForm.formState.errors.pin?.message}
            {...cardForm.register('pin', {
              required: 'PIN is required',
              minLength: { value: 4, message: 'PIN must be at least 4 digits' },
            })}
          />
          <button
            type="submit"
            disabled={cardForm.formState.isSubmitting}
            className="mt-2 w-full rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 py-3 text-sm font-semibold text-white shadow-glow transition enabled:hover:brightness-110 disabled:opacity-60"
          >
            {cardForm.formState.isSubmitting ? 'Authenticating…' : 'Secure login'}
          </button>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-slate-600">
        New to NovaBank?{' '}
        <Link className="font-semibold text-brand-700 hover:underline" to="/signup">
          Open an account
        </Link>
      </p>
    </AuthLayout>
  )
}
