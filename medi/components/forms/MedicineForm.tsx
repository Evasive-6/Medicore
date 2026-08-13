'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function MedicineForm({ onDone }: { onDone?: () => void }) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    setError('')

    const form = new FormData(e.currentTarget)
    const payload = Object.fromEntries(form.entries())

    const res = await fetch('/api/medicines', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      setError('Failed to add medicine.')
      setSaving(false)
      return
    }

    router.refresh()
    onDone?.()
  }

  const input =
    'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/30'
  const label = 'mb-1 block text-sm font-medium text-gray-700'

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={label}>Medicine name *</label>
          <input name="name" required className={input} placeholder="Paracetamol 500mg" />
        </div>
        <div>
          <label className={label}>Category *</label>
          <input name="category" required className={input} placeholder="Analgesic" />
        </div>
        <div>
          <label className={label}>Manufacturer</label>
          <input name="manufacturer" className={input} placeholder="MedPharm" />
        </div>
        <div>
          <label className={label}>Unit</label>
          <input name="unit" className={input} defaultValue="strip" placeholder="strip / bottle / vial" />
        </div>
        <div>
          <label className={label}>Price ($) *</label>
          <input name="price" type="number" min="0" step="0.01" required className={input} />
        </div>
        <div>
          <label className={label}>Initial stock *</label>
          <input name="stock" type="number" min="0" required className={input} defaultValue="0" />
        </div>
        <div className="sm:col-span-2">
          <label className={label}>Expiry date</label>
          <input name="expiryDate" type="date" className={input} />
        </div>
      </div>

      {error && <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onDone}
          className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-60"
        >
          {saving ? 'Saving…' : 'Add medicine'}
        </button>
      </div>
    </form>
  )
}
