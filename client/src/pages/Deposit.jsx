import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { motion, AnimatePresence } from 'framer-motion'
import FormInput from '../components/FormInput.jsx'
import api from '../services/api.js'
import { useToast } from '../context/ToastContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { formatINR } from '../utils/format.js'

export default function Deposit() {
  const { push } = useToast()
  const { refreshMe } = useAuth()
  const [done, setDone] = useState(null)
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: { amount: '', description: '' } })

  const onSubmit = async (values) => {
    try {
      const { data } = await api.post('/api/transactions/deposit', {
        amount: Number(values.amount),
        description: values.description || 'Cash deposit',
      })
      setDone({ balance: data.balance, amount: Number(values.amount) })
      push(`Deposit successful. New balance ${formatINR(data.balance)}`)
      reset()
      await refreshMe()
    } catch (e) {
      push(e?.response?.data?.error || 'Deposit failed.', 'error')
    }
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-slate-900">Add funds</h1>
        <p className="mt-1 text-sm text-slate-600">
          Demo deposit — credits post to your ledger immediately and update your available balance.
        </p>
      </div>
      <AnimatePresence>
        {done && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900"
          >
            <p className="font-semibold">Posted {formatINR(done.amount)}</p>
            <p className="mt-1 text-emerald-800/90">New balance {formatINR(done.balance)}</p>
            <button
              type="button"
              onClick={() => setDone(null)}
              className="mt-2 text-xs font-semibold text-emerald-800 underline"
            >
              Dismiss
            </button>
          </motion.div>
        )}
      </AnimatePresence>
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
        <FormInput label="Remarks (optional)" {...register('description')} />
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 py-3 text-sm font-semibold text-white shadow-glow disabled:opacity-60"
        >
          {isSubmitting ? 'Posting…' : 'Confirm deposit'}
        </button>
      </form>
    </div>
  )
}
