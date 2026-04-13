import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import AuthLayout from '../layouts/AuthLayout.jsx'
import FormInput from '../components/FormInput.jsx'
import api from '../services/api.js'
import { useToast } from '../context/ToastContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import SignupCredentialsCard from '../components/SignupCredentialsCard.jsx'

const steps = ['Personal', 'Profile', 'Security']

export default function SignupWizard() {
  const { push } = useToast()
  const { bootstrapSession } = useAuth()
  const nav = useNavigate()
  const [step, setStep] = useState(0)
  const [signupToken, setSignupToken] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  /** After signup API: show full card / account before dashboard. */
  const [issued, setIssued] = useState(null)

  const form = useForm({
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      dob: '',
      gender: '',
      address: '',
      city: '',
      state: '',
      pincode: '',
      occupation: '',
      income: '',
      education: '',
      maritalStatus: '',
      accountType: 'Savings',
      pin: '',
      confirmPin: '',
    },
  })

  const { register, handleSubmit, trigger, getValues, formState: { errors } } = form

  const nextFromStep0 = async () => {
    const ok = await trigger(['fullName', 'email', 'phone'])
    if (!ok) return
    setSubmitting(true)
    try {
      const { data } = await api.post('/api/auth/signup/step1', {
        fullName: getValues('fullName'),
        email: getValues('email'),
        phone: getValues('phone'),
      })
      setSignupToken(data.signupToken)
      setStep(1)
      push('Personal details saved.')
    } catch (e) {
      push(e?.response?.data?.error || 'Unable to continue signup.', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const nextFromStep1 = async () => {
    setSubmitting(true)
    try {
      await api.post('/api/auth/signup/step2', {
        signupToken,
        dob: getValues('dob') || undefined,
        gender: getValues('gender') || undefined,
        address: getValues('address') || undefined,
        city: getValues('city') || undefined,
        state: getValues('state') || undefined,
        pincode: getValues('pincode') || undefined,
        occupation: getValues('occupation') || undefined,
        income: getValues('income') || undefined,
        education: getValues('education') || undefined,
        maritalStatus: getValues('maritalStatus') || undefined,
      })
      setStep(2)
      push('Profile details saved.')
    } catch (e) {
      push(e?.response?.data?.error || 'Session expired — restart signup.', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const finish = handleSubmit(async (values) => {
    if (values.pin !== values.confirmPin) {
      push('PINs do not match.', 'error')
      return
    }
    setSubmitting(true)
    try {
      const { data } = await api.post('/api/auth/signup/step3', {
        signupToken,
        pin: values.pin,
        accountType: values.accountType,
      })
      await bootstrapSession(data.token)
      setIssued({
        cardNumber: data.account.cardNumber,
        accountNumber: data.account.accountNumber,
        accountType: data.account.accountType,
      })
      push('Account created — save your card details below.')
    } catch (e) {
      push(e?.response?.data?.error || 'Could not create account.', 'error')
    } finally {
      setSubmitting(false)
    }
  })

  return (
    <AuthLayout
      title={issued ? 'Save your login details' : 'Create your NovaBank account'}
      subtitle={
        issued
          ? 'Copy or download your card number now. You will use it with your PIN every time you sign in.'
          : 'A guided 3-step flow mirrors legacy desktop onboarding — with modern validation, secure PIN hashing, and instant virtual card issuance.'
      }
    >
      {issued ? (
        <SignupCredentialsCard
          cardNumber={issued.cardNumber}
          accountNumber={issued.accountNumber}
          accountType={issued.accountType}
          onContinue={() => nav('/app', { replace: true })}
        />
      ) : (
        <>
          <div className="mb-6 flex items-center justify-between gap-2">
            {steps.map((label, i) => (
              <div key={label} className="flex flex-1 flex-col items-center gap-2">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold ${
                    i <= step ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {i + 1}
                </div>
                <p className="hidden text-center text-[11px] font-medium text-slate-600 sm:block">{label}</p>
              </div>
            ))}
          </div>

          {step === 0 && (
            <div className="space-y-4">
              <FormInput
                label="Full name"
                {...register('fullName', { required: 'Required' })}
                error={errors.fullName?.message}
              />
              <FormInput
                label="Email"
                type="email"
                {...register('email', { required: 'Required' })}
                error={errors.email?.message}
              />
              <FormInput
                label="Phone"
                {...register('phone', { required: 'Required' })}
                error={errors.phone?.message}
              />
              <button
                type="button"
                disabled={submitting}
                onClick={nextFromStep0}
                className="w-full rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 py-3 text-sm font-semibold text-white shadow-glow disabled:opacity-60"
              >
                Continue
              </button>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <FormInput label="Date of birth" type="date" {...register('dob')} />
              <FormInput label="Gender" {...register('gender')} placeholder="Optional" />
              <FormInput label="Address" {...register('address')} />
              <div className="grid gap-4 sm:grid-cols-2">
                <FormInput label="City" {...register('city')} />
                <FormInput label="State" {...register('state')} />
              </div>
              <FormInput label="PIN code" {...register('pincode')} />
              <FormInput label="Occupation" {...register('occupation')} />
              <div className="grid gap-4 sm:grid-cols-2">
                <FormInput label="Income band" {...register('income')} placeholder="e.g. 10-20 LPA" />
                <FormInput label="Education" {...register('education')} />
              </div>
              <FormInput label="Marital status" {...register('maritalStatus')} />
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(0)}
                  className="w-full rounded-2xl border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-800"
                >
                  Back
                </button>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={nextFromStep1}
                  className="w-full rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 py-3 text-sm font-semibold text-white shadow-glow disabled:opacity-60"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <form onSubmit={finish} className="space-y-4">
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-slate-700">Account type</span>
                <select
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm shadow-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                  {...register('accountType')}
                >
                  <option value="Savings">Savings</option>
                  <option value="Current">Current</option>
                </select>
              </label>
              <FormInput
                label="Create ATM PIN"
                type="password"
                inputMode="numeric"
                hint="4–12 digits. Stored hashed on the server."
                {...register('pin', {
                  required: 'PIN required',
                  minLength: { value: 4, message: 'Minimum 4 digits' },
                })}
                error={errors.pin?.message}
              />
              <FormInput
                label="Confirm PIN"
                type="password"
                inputMode="numeric"
                {...register('confirmPin', { required: 'Confirm your PIN' })}
                error={errors.confirmPin?.message}
              />
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-full rounded-2xl border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-800"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 py-3 text-sm font-semibold text-white shadow-glow disabled:opacity-60"
                >
                  {submitting ? 'Creating…' : 'Open account'}
                </button>
              </div>
            </form>
          )}

          <p className="mt-6 text-center text-sm text-slate-600">
            Already banking with us?{' '}
            <Link className="font-semibold text-brand-700 hover:underline" to="/login">
              Sign in
            </Link>
          </p>
        </>
      )}
    </AuthLayout>
  )
}
