import { useState } from 'react'
import { motion } from 'framer-motion'
import { Copy, Download, Check } from 'lucide-react'
import { formatCardGroups } from '../utils/format.js'
import { setSavedCardNumber } from '../utils/cardStorage.js'
import { useToast } from '../context/ToastContext.jsx'

export default function SignupCredentialsCard({
  cardNumber,
  accountNumber,
  accountType,
  onContinue,
}) {
  const { push } = useToast()
  const [remember, setRemember] = useState(false)
  const [copiedField, setCopiedField] = useState(null)

  const cardDigits = String(cardNumber || '').replace(/\D/g, '')
  const cardDisplay = formatCardGroups(cardDigits)

  const copyText = async (label, text) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(label)
      setTimeout(() => setCopiedField(null), 2000)
      push('Copied to clipboard.')
    } catch {
      push('Could not copy — select and copy manually.', 'error')
    }
  }

  const downloadTxt = () => {
    const body = [
      'NovaBank Net Banking — save this file in a safe place',
      '',
      `Account type: ${accountType}`,
      `Card number (optional card login): ${cardDigits}`,
      `Account number: ${accountNumber}`,
      '',
      'Sign in with your email + password, or card number + ATM PIN.',
      '',
      `Issued: ${new Date().toISOString()}`,
    ].join('\n')
    const blob = new Blob([body], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `novabank-credentials-${accountNumber}.txt`
    a.click()
    URL.revokeObjectURL(url)
    push('Download started.')
  }

  const handleContinue = () => {
    if (remember) setSavedCardNumber(cardDigits)
    onContinue()
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-5"
    >
      <div className="rounded-2xl border border-amber-200/80 bg-amber-50/90 px-4 py-3 text-sm text-amber-950 shadow-sm">
        <p className="font-semibold">Important</p>
        <p className="mt-1 leading-relaxed text-amber-900/90">
          You will need your <span className="font-medium">full card number</span> to sign in. The
          dashboard only shows a masked card for security.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-card">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Card number</p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <p className="font-mono text-base font-semibold tracking-wide text-slate-900 sm:text-lg">
            {cardDisplay}
          </p>
          <button
            type="button"
            onClick={() => copyText('card', cardDigits)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
          >
            {copiedField === 'card' ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
            Copy
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-card">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Account number</p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <p className="font-mono text-base font-semibold text-slate-900">{accountNumber}</p>
          <button
            type="button"
            onClick={() => copyText('acct', accountNumber)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
          >
            {copiedField === 'acct' ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
            Copy
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={downloadTxt}
        className="flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50"
      >
        <Download className="h-4 w-4" />
        Download as .txt
      </button>

      <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3">
        <input
          type="checkbox"
          className="mt-1 h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
          checked={remember}
          onChange={(e) => setRemember(e.target.checked)}
        />
        <span className="text-sm leading-snug text-slate-700">
          <span className="font-semibold text-slate-900">Remember card on this device</span>
          <span className="block text-slate-600">
            Pre-fills the login screen (simulator only; do not use on shared computers).
          </span>
        </span>
      </label>

      <button
        type="button"
        onClick={handleContinue}
        className="w-full rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 py-3 text-sm font-semibold text-white shadow-glow transition hover:brightness-110"
      >
        Continue to dashboard
      </button>
    </motion.div>
  )
}
