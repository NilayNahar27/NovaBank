import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Trash2, UserPlus } from 'lucide-react'
import FormInput from '../components/FormInput.jsx'
import api from '../services/api.js'
import { useToast } from '../context/ToastContext.jsx'
import { formatDateTime } from '../utils/format.js'

export default function Beneficiaries() {
  const { push } = useToast()
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState({
    beneficiaryName: '',
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    nickname: '',
  })

  const load = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/api/beneficiaries')
      setRows(data.beneficiaries || [])
    } catch {
      push('Could not load beneficiaries.', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const add = async (e) => {
    e.preventDefault()
    setAdding(true)
    try {
      await api.post('/api/beneficiaries', {
        beneficiaryName: form.beneficiaryName.trim(),
        bankName: form.bankName.trim(),
        accountNumber: form.accountNumber.trim(),
        ifscCode: form.ifscCode.trim(),
        nickname: form.nickname.trim() || undefined,
      })
      push('Beneficiary saved.')
      setForm({ beneficiaryName: '', bankName: '', accountNumber: '', ifscCode: '', nickname: '' })
      await load()
    } catch (e) {
      push(e?.response?.data?.error || 'Could not add beneficiary.', 'error')
    } finally {
      setAdding(false)
    }
  }

  const remove = async (id) => {
    if (!window.confirm('Remove this beneficiary?')) return
    try {
      await api.delete(`/api/beneficiaries/${id}`)
      push('Beneficiary removed.')
      await load()
    } catch {
      push('Remove failed.', 'error')
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <h1 className="font-display text-2xl font-semibold text-slate-900">Beneficiaries</h1>
        <p className="mt-1 text-sm text-slate-600">Save trusted payees for faster transfers in this demo bank.</p>
      </div>

      <motion.form
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={add}
        className="grid gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-card md:grid-cols-2"
      >
        <div className="md:col-span-2 flex items-center gap-2 text-sm font-semibold text-slate-900">
          <UserPlus className="h-4 w-4 text-brand-600" />
          Add beneficiary
        </div>
        <FormInput
          label="Beneficiary name"
          value={form.beneficiaryName}
          onChange={(e) => setForm((f) => ({ ...f, beneficiaryName: e.target.value }))}
          required
        />
        <FormInput
          label="Bank name"
          value={form.bankName}
          onChange={(e) => setForm((f) => ({ ...f, bankName: e.target.value }))}
          required
        />
        <FormInput
          label="Account number"
          value={form.accountNumber}
          onChange={(e) => setForm((f) => ({ ...f, accountNumber: e.target.value }))}
          required
        />
        <FormInput
          label="IFSC"
          value={form.ifscCode}
          onChange={(e) => setForm((f) => ({ ...f, ifscCode: e.target.value }))}
          required
        />
        <FormInput
          label="Nickname (optional)"
          value={form.nickname}
          onChange={(e) => setForm((f) => ({ ...f, nickname: e.target.value }))}
        />
        <div className="md:col-span-2">
          <button
            type="submit"
            disabled={adding}
            className="w-full rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 py-3 text-sm font-semibold text-white shadow-glow disabled:opacity-60 md:w-auto md:px-8"
          >
            {adding ? 'Saving…' : 'Save beneficiary'}
          </button>
        </div>
      </motion.form>

      <div>
        <h2 className="mb-3 font-display text-lg font-semibold text-slate-900">Saved list</h2>
        {loading && <p className="text-sm text-slate-500">Loading…</p>}
        {!loading && !rows.length && (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center text-sm text-slate-600">
            No beneficiaries yet — add your first payee above.
          </div>
        )}
        <div className="grid gap-4 md:grid-cols-2">
          {!loading &&
            rows.map((b) => (
              <motion.div
                key={b.id}
                layout
                className="relative rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <button
                  type="button"
                  onClick={() => remove(b.id)}
                  className="absolute right-3 top-3 rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                  aria-label="Remove beneficiary"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                <p className="pr-10 font-semibold text-slate-900">{b.beneficiary_name}</p>
                {b.nickname && <p className="text-xs text-slate-500">“{b.nickname}”</p>}
                <p className="mt-2 text-sm text-slate-600">{b.bank_name}</p>
                <p className="font-mono text-sm text-slate-800">{b.account_number}</p>
                <p className="text-xs font-medium text-slate-500">IFSC {b.ifsc_code}</p>
                <p className="mt-3 text-[11px] text-slate-400">Added {formatDateTime(b.created_at)}</p>
              </motion.div>
            ))}
        </div>
      </div>
    </div>
  )
}
