import { useForm } from 'react-hook-form'
import FormInput from '../components/FormInput.jsx'
import api from '../services/api.js'
import { useToast } from '../context/ToastContext.jsx'

export default function ChangePin() {
  const { push } = useToast()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: { currentPin: '', newPin: '', confirm: '' } })

  const onSubmit = async (values) => {
    if (values.newPin !== values.confirm) {
      push('New PIN and confirmation do not match.', 'error')
      return
    }
    try {
      await api.post('/api/account/change-pin', {
        currentPin: values.currentPin,
        newPin: values.newPin,
      })
      push('PIN updated successfully.')
      reset()
    } catch (e) {
      push(e?.response?.data?.error || 'PIN change failed.', 'error')
    }
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-slate-900">Change PIN</h1>
        <p className="mt-1 text-sm text-slate-600">
          We verify your current PIN before applying a new hash. You will receive an in-app alert when the change
          completes.
        </p>
      </div>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-card"
      >
        <FormInput
          label="Current PIN"
          type="password"
          inputMode="numeric"
          {...register('currentPin', { required: 'Required' })}
          error={errors.currentPin?.message}
        />
        <FormInput
          label="New PIN"
          type="password"
          inputMode="numeric"
          {...register('newPin', { required: 'Required', minLength: { value: 4, message: 'Min 4 digits' } })}
          error={errors.newPin?.message}
        />
        <FormInput
          label="Confirm new PIN"
          type="password"
          inputMode="numeric"
          {...register('confirm', { required: 'Required' })}
          error={errors.confirm?.message}
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-2xl bg-gradient-to-r from-slate-900 to-brand-900 py-3 text-sm font-semibold text-white shadow-glow disabled:opacity-60"
        >
          {isSubmitting ? 'Updating…' : 'Update PIN'}
        </button>
      </form>
    </div>
  )
}
