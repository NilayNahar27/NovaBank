import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { KeyRound, Lock } from 'lucide-react'
import FormInput from '../components/FormInput.jsx'
import api from '../services/api.js'
import { useToast } from '../context/ToastContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'

export default function Security() {
  const { push } = useToast()
  const { me, refreshMe } = useAuth()
  const form = useForm({ defaultValues: { currentPassword: '', newPassword: '', confirm: '' } })

  const onPassword = form.handleSubmit(async (values) => {
    if (values.newPassword !== values.confirm) {
      push('New password and confirmation do not match.', 'error')
      return
    }
    try {
      await api.post('/api/account/change-password', {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      })
      push('Password updated successfully.')
      form.reset()
      await refreshMe()
    } catch (e) {
      push(e?.response?.data?.error || 'Password change failed.', 'error')
    }
  })

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="font-display text-2xl font-semibold text-slate-900">Security</h1>
        <p className="mt-1 text-sm text-slate-600">Manage credentials used for NovaBank Online.</p>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-card">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
            <Lock className="h-5 w-5" />
          </div>
          <div>
            <p className="font-semibold text-slate-900">ATM / debit PIN</p>
            <p className="text-sm text-slate-600">Change the PIN used with your virtual card.</p>
          </div>
        </div>
        <Link
          to="/change-pin"
          className="mt-4 inline-flex rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
        >
          Change PIN
        </Link>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-card">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700">
            <KeyRound className="h-5 w-5" />
          </div>
          <div>
            <p className="font-semibold text-slate-900">Net banking password</p>
            <p className="text-sm text-slate-600">
              {me?.user?.hasPassword
                ? 'Rotate your password regularly in production environments.'
                : 'Set a password via signup or seed script to enable this form.'}
            </p>
          </div>
        </div>

        {me?.user?.hasPassword ? (
          <form onSubmit={onPassword} className="mt-6 space-y-4">
            <FormInput
              label="Current password"
              type="password"
              autoComplete="current-password"
              {...form.register('currentPassword', { required: true })}
              error={form.formState.errors.currentPassword?.message}
            />
            <FormInput
              label="New password"
              type="password"
              autoComplete="new-password"
              {...form.register('newPassword', { required: true, minLength: { value: 8, message: 'Min 8 chars' } })}
              error={form.formState.errors.newPassword?.message}
            />
            <FormInput
              label="Confirm new password"
              type="password"
              {...form.register('confirm', { required: true })}
              error={form.formState.errors.confirm?.message}
            />
            <button
              type="submit"
              disabled={form.formState.isSubmitting}
              className="w-full rounded-2xl bg-gradient-to-r from-indigo-600 to-brand-600 py-3 text-sm font-semibold text-white shadow-glow disabled:opacity-60"
            >
              {form.formState.isSubmitting ? 'Updating…' : 'Update password'}
            </button>
          </form>
        ) : (
          <p className="mt-4 text-sm text-amber-800">
            This account does not have a net banking password on file. Use card login, or re-seed the database with
            the latest script.
          </p>
        )}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
        Sessions are JWT-based for this demo. Logout clears the token from this browser only.
      </div>
    </div>
  )
}
