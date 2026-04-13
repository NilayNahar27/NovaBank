import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, CheckCircle2 } from 'lucide-react'
import FormInput from '../components/FormInput.jsx'
import api from '../services/api.js'
import { useToast } from '../context/ToastContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { formatINR } from '../utils/format.js'

export default function Transfer() {
  const { push } = useToast()
  const { refreshMe } = useAuth()
  const [beneficiaries, setBeneficiaries] = useState([])
  const [mode, setMode] = useState('saved')
  const [step, setStep] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState(null)
  const [form, setForm] = useState({
    beneficiaryId: '',
    beneficiaryName: '',
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    amount: '',
    remarks: '',
  })

  useEffect(() => {
    ;(async () => {
      try {
        const { data } = await api.get('/api/beneficiaries')
        setBeneficiaries(data.beneficiaries || [])
      } catch {
        /* ignore */
      }
    })()
  }, [])

  const buildPayload = () => {
    const amount = Number(form.amount)
    const base = { amount, remarks: form.remarks.trim() || undefined }
    if (mode === 'saved' && form.beneficiaryId) {
      return { ...base, beneficiaryId: Number(form.beneficiaryId) }
    }
    return {
      ...base,
      beneficiaryName: form.beneficiaryName.trim(),
      bankName: form.bankName.trim(),
      accountNumber: form.accountNumber.trim(),
      ifscCode: form.ifscCode.trim(),
    }
  }

  const validateStep1 = () => {
    const amount = Number(form.amount)
    if (!Number.isFinite(amount) || amount <= 0) {
      push('Enter a valid amount.', 'error')
      return false
    }
    if (mode === 'saved') {
      if (!form.beneficiaryId) {
        push('Select a beneficiary or switch to one-time transfer.', 'error')
        return false
      }
    } else {
      if (!form.beneficiaryName || !form.bankName || !form.accountNumber || !form.ifscCode) {
        push('Fill all payee fields.', 'error')
        return false
      }
    }
    return true
  }

  const goConfirm = (e) => {
    e.preventDefault()
    if (!validateStep1()) return
    setStep(2)
  }

  const execute = async () => {
    setSubmitting(true)
    try {
      const { data } = await api.post('/api/transfers', buildPayload())
      setResult(data)
      push('Transfer completed.')
      await refreshMe()
      setStep(3)
    } catch (e) {
      push(e?.response?.data?.error || 'Transfer failed.', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const resetFlow = () => {
    setStep(1)
    setResult(null)
    setForm((f) => ({ ...f, amount: '', remarks: '' }))
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-slate-900">Transfer funds</h1>
        <p className="mt-1 text-sm text-slate-600">IMPS-style demo transfer with confirmation and receipt.</p>
      </div>

      <div className="flex gap-2 text-xs font-semibold">
        <span className={step >= 1 ? 'text-brand-700' : 'text-slate-400'}>1 · Details</span>
        <span className="text-slate-300">/</span>
        <span className={step >= 2 ? 'text-brand-700' : 'text-slate-400'}>2 · Confirm</span>
        <span className="text-slate-300">/</span>
        <span className={step >= 3 ? 'text-brand-700' : 'text-slate-400'}>3 · Done</span>
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.form
            key="s1"
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 8 }}
            onSubmit={goConfirm}
            className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-card"
          >
            <div className="flex rounded-xl border border-slate-200 bg-slate-50 p-1 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setMode('saved')}
                className={`flex-1 rounded-lg py-2 ${mode === 'saved' ? 'bg-white shadow-sm' : ''}`}
              >
                Saved beneficiary
              </button>
              <button
                type="button"
                onClick={() => setMode('onetime')}
                className={`flex-1 rounded-lg py-2 ${mode === 'onetime' ? 'bg-white shadow-sm' : ''}`}
              >
                One-time
              </button>
            </div>

            {mode === 'saved' ? (
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-slate-700">Beneficiary</span>
                <select
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm shadow-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                  value={form.beneficiaryId}
                  onChange={(e) => setForm((f) => ({ ...f, beneficiaryId: e.target.value }))}
                >
                  <option value="">Select…</option>
                  {beneficiaries.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.nickname ? `${b.nickname} — ` : ''}
                      {b.beneficiary_name} · …{String(b.account_number).slice(-4)}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-slate-500">
                  Manage payees on the{' '}
                  <Link className="font-semibold text-brand-700 hover:underline" to="/beneficiaries">
                    beneficiaries
                  </Link>{' '}
                  screen.
                </p>
              </label>
            ) : (
              <>
                <FormInput
                  label="Beneficiary name"
                  value={form.beneficiaryName}
                  onChange={(e) => setForm((f) => ({ ...f, beneficiaryName: e.target.value }))}
                />
                <FormInput
                  label="Bank name"
                  value={form.bankName}
                  onChange={(e) => setForm((f) => ({ ...f, bankName: e.target.value }))}
                />
                <FormInput
                  label="Account number"
                  value={form.accountNumber}
                  onChange={(e) => setForm((f) => ({ ...f, accountNumber: e.target.value }))}
                />
                <FormInput
                  label="IFSC"
                  value={form.ifscCode}
                  onChange={(e) => setForm((f) => ({ ...f, ifscCode: e.target.value }))}
                />
              </>
            )}

            <FormInput
              label="Amount (INR)"
              type="number"
              step="0.01"
              min="1"
              value={form.amount}
              onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
            />
            <FormInput
              label="Remarks (optional)"
              value={form.remarks}
              onChange={(e) => setForm((f) => ({ ...f, remarks: e.target.value }))}
            />
            <button
              type="submit"
              className="w-full rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 py-3 text-sm font-semibold text-white shadow-glow"
            >
              Review transfer
            </button>
          </motion.form>
        )}

        {step === 2 && (
          <motion.div
            key="s2"
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 8 }}
            className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-card"
          >
            <p className="text-sm text-slate-700">You are about to send</p>
            <p className="font-display text-3xl font-semibold text-slate-900">{formatINR(Number(form.amount))}</p>
            <div className="rounded-xl bg-slate-50 p-3 text-sm text-slate-700">
              {mode === 'saved' ? (
                <p>
                  To saved beneficiary ID <span className="font-mono font-semibold">{form.beneficiaryId}</span>
                </p>
              ) : (
                <p>
                  To {form.beneficiaryName} · {form.bankName} · {form.accountNumber}
                </p>
              )}
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border border-slate-200 py-3 text-sm font-semibold text-slate-800"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={execute}
                className="flex-1 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 py-3 text-sm font-semibold text-white shadow-glow disabled:opacity-60"
              >
                {submitting ? 'Processing…' : 'Confirm transfer'}
              </button>
            </div>
          </motion.div>
        )}

        {step === 3 && result?.transfer && (
          <motion.div
            key="s3"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-4 rounded-3xl border border-emerald-200 bg-emerald-50/60 p-6 text-center shadow-card"
          >
            <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-600" />
            <p className="font-semibold text-emerald-900">Transfer successful</p>
            <p className="text-sm text-emerald-900/90">
              Reference <span className="font-mono font-bold">{result.transfer.reference_number}</span>
            </p>
            <p className="text-xs text-emerald-800/80">New balance {formatINR(result.balance)}</p>
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
              <Link
                to={`/transfers/${result.transfer.id}/receipt`}
                className="rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-brand-800 shadow-sm ring-1 ring-emerald-200"
              >
                View receipt
              </Link>
              <button
                type="button"
                onClick={resetFlow}
                className="rounded-2xl border border-emerald-300 bg-emerald-600/10 px-4 py-2 text-sm font-semibold text-emerald-900"
              >
                New transfer
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
