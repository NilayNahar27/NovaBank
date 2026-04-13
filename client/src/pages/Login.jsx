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
  const { login } = useAuth()
  const { push } = useToast()
  const nav = useNavigate()
  const loc = useLocation()
  const from = loc.state?.from || '/app'
  const [hasSavedCard, setHasSavedCard] = useState(() => !!getSavedCardNumber())

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: { cardNumber: '', pin: '' } })

  useEffect(() => {
    const saved = getSavedCardNumber()
    if (saved) {
      reset({ cardNumber: formatCardGroups(saved), pin: '' })
      setHasSavedCard(true)
    }
  }, [reset])

  const onSubmit = async (values) => {
    try {
      const card = String(values.cardNumber).replace(/\s/g, '')
      await login(card, values.pin)
      push('Welcome back — session secured.')
      nav(from, { replace: true })
    } catch (e) {
      const msg = e?.response?.data?.error || 'Unable to sign in. Check your details.'
      push(msg, 'error')
    }
  }

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in with your 16-digit card number and ATM PIN. Your credentials are validated on the server and protected with JWT sessions."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormInput
          label="Card number"
          placeholder="4532 0151 1283 0366"
          inputMode="numeric"
          autoComplete="off"
          error={errors.cardNumber?.message}
          {...register('cardNumber', {
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
              reset({ cardNumber: '', pin: '' })
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
          error={errors.pin?.message}
          {...register('pin', {
            required: 'PIN is required',
            minLength: { value: 4, message: 'PIN must be at least 4 digits' },
          })}
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-2 w-full rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 py-3 text-sm font-semibold text-white shadow-glow transition enabled:hover:brightness-110 disabled:opacity-60"
        >
          {isSubmitting ? 'Authenticating…' : 'Secure login'}
        </button>
        <p className="text-center text-sm text-slate-600">
          New to NovaBank?{' '}
          <Link className="font-semibold text-brand-700 hover:underline" to="/signup">
            Create an account
          </Link>
        </p>
      </form>
    </AuthLayout>
  )
}
