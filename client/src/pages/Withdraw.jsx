import { useForm } from 'react-hook-form'
import FormInput from '../components/FormInput.jsx'
import api from '../services/api.js'
import { useToast } from '../context/ToastContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { formatINR } from '../utils/format.js'

export default function Withdraw() {
  const { push } = useToast()
  const { refreshMe } = useAuth()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: { amount: '', description: '' } })

  const onSubmit = async (values) => {
    try {
      const { data } = await api.post('/api/transactions/withdraw', {
        amount: Number(values.amount),
        description: values.description || 'ATM withdrawal',
      })
      push(`Withdrawal successful. New balance ${formatINR(data.balance)}`)
      reset()
      await refreshMe()
    } catch (e) {
      push(e?.response?.data?.error || 'Withdrawal failed.', 'error')
    }
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-slate-900">Withdraw cash</h1>
        <p className="mt-1 text-sm text-slate-600">
          Withdrawals create debit ledger entries. The server rejects requests that exceed your available
          balance.
        </p>
      </div>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-card"
      >
        <FormInput
          label="Amount (INR)"
          type="number"
          step="0.01"
          min="1"
          {...register('amount', { required: 'Amount is required', min: { value: 1, message: 'Must be positive' } })}
          error={errors.amount?.message}
        />
        <FormInput label="Note (optional)" {...register('description')} />
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-2xl bg-gradient-to-r from-rose-600 to-orange-600 py-3 text-sm font-semibold text-white shadow-glow disabled:opacity-60"
        >
          {isSubmitting ? 'Processing…' : 'Confirm withdrawal'}
        </button>
      </form>
    </div>
  )
}
