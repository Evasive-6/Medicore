'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function DoctorForm({ onDone }: { onDone?: () => void }) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    setError('')

    const form = new FormData(e.currentTarget)
    const payload = Object.fromEntries(form.entries())

    const res = await fetch('/api/doctors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    const data = await res.json()
    if (!res.ok) {
      setError(data.error || 'Failed to add doctor.')
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
          <label className={label}>Full name *</label>
          <input name="name" required className={input} placeholder="Dr. Jane Doe" />
        </div>
        <div>
          <label className={label}>Email *</label>
          <input name="email" type="email" required className={input} placeholder="jane@medicore.dev" />
        </div>
        <div>
          <label className={label}>Phone *</label>
          <input name="phone" required className={input} placeholder="555-0100" />
        </div>
        <div>
          <label className={label}>Specialization *</label>
          <input name="specialization" required className={input} placeholder="Cardiology" />
        </div>
        <div>
          <label className={label}>Years of experience</label>
          <input name="experienceYears" type="number" min="0" className={input} defaultValue="0" />
        </div>
        <div>
          <label className={label}>Consultation fee ($)</label>
          <input name="fee" type="number" min="0" step="0.01" className={input} defaultValue="0" />
        </div>
        <div>
          <label className={label}>Initial password</label>
          <input name="password" type="text" className={input} placeholder="doctor123" />
        </div>
        <div>
          <label className={label}>Available</label>
          <select name="available" className={input} defaultValue="true">
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
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
          {saving ? 'Saving…' : 'Add doctor'}
        </button>
      </div>
    </form>
  )
}
