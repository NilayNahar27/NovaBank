import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import FormInput from '../components/FormInput.jsx'
import api from '../services/api.js'
import { useToast } from '../context/ToastContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'

export default function Profile() {
  const { push } = useToast()
  const { refreshMe } = useAuth()
  const form = useForm({
    defaultValues: {
      fullName: '',
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
    },
  })

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const { data } = await api.get('/api/account/profile')
        const p = data.profile
        if (cancelled || !p) return
        form.reset({
          fullName: p.full_name || '',
          phone: p.phone || '',
          dob: p.dob ? String(p.dob).slice(0, 10) : '',
          gender: p.gender || '',
          address: p.address || '',
          city: p.city || '',
          state: p.state || '',
          pincode: p.pincode || '',
          occupation: p.occupation || '',
          income: p.income || '',
          education: p.education || '',
          maritalStatus: p.marital_status || '',
        })
      } catch {
        push('Could not load profile.', 'error')
      }
    })()
    return () => {
      cancelled = true
    }
  }, [form, push])

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await api.patch('/api/account/profile', values)
      push('Profile saved.')
      await refreshMe()
    } catch (e) {
      push(e?.response?.data?.error || 'Update failed.', 'error')
    }
  })

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-slate-900">Profile</h1>
        <p className="mt-1 text-sm text-slate-600">Keep your contact details current for alerts and statements.</p>
      </div>

      <form
        onSubmit={onSubmit}
        className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-card"
      >
        <FormInput label="Full name" {...form.register('fullName')} error={form.formState.errors.fullName?.message} />
        <FormInput label="Phone" {...form.register('phone')} error={form.formState.errors.phone?.message} />
        <FormInput label="Date of birth" type="date" {...form.register('dob')} />
        <FormInput label="Gender" {...form.register('gender')} />
        <FormInput label="Address" {...form.register('address')} />
        <div className="grid gap-4 sm:grid-cols-2">
          <FormInput label="City" {...form.register('city')} />
          <FormInput label="State" {...form.register('state')} />
        </div>
        <FormInput label="PIN code" {...form.register('pincode')} />
        <FormInput label="Occupation" {...form.register('occupation')} />
        <div className="grid gap-4 sm:grid-cols-2">
          <FormInput label="Income band" {...form.register('income')} />
          <FormInput label="Education" {...form.register('education')} />
        </div>
        <FormInput label="Marital status" {...form.register('maritalStatus')} />
        <button
          type="submit"
          disabled={form.formState.isSubmitting}
          className="w-full rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 py-3 text-sm font-semibold text-white shadow-glow disabled:opacity-60"
        >
          {form.formState.isSubmitting ? 'Saving…' : 'Save changes'}
        </button>
      </form>
    </div>
  )
}
