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

  const input = 'input'
  const label = 'input-label'

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

      {error && (
        <div className="rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="flex justify-end gap-3">
        <button type="button" onClick={onDone} className="btn-ghost">
          Cancel
        </button>
        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? 'Saving…' : 'Add doctor'}
        </button>
      </div>
    </form>
  )
}
