'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function PatientForm({ onDone }: { onDone?: () => void }) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    setError('')

    const form = new FormData(e.currentTarget)
    const payload = Object.fromEntries(form.entries())

    const res = await fetch('/api/patients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      setError('Failed to register patient.')
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
          <input name="name" required className={input} placeholder="Jane Doe" />
        </div>
        <div>
          <label className={label}>Email</label>
          <input name="email" type="email" className={input} placeholder="jane@example.com" />
        </div>
        <div>
          <label className={label}>Phone *</label>
          <input name="phone" required className={input} placeholder="555-0000" />
        </div>
        <div>
          <label className={label}>Gender</label>
          <select name="gender" className={input} defaultValue="OTHER">
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
            <option value="OTHER">Other</option>
          </select>
        </div>
        <div>
          <label className={label}>Date of birth</label>
          <input name="dateOfBirth" type="date" className={input} />
        </div>
        <div>
          <label className={label}>Blood group</label>
          <select name="bloodGroup" className={input} defaultValue="">
            <option value="">Unknown</option>
            {['A_POSITIVE', 'A_NEGATIVE', 'B_POSITIVE', 'B_NEGATIVE', 'AB_POSITIVE', 'AB_NEGATIVE', 'O_POSITIVE', 'O_NEGATIVE'].map((b) => (
              <option key={b} value={b}>
                {b.replace('_', ' ')}
              </option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className={label}>Address</label>
          <input name="address" className={input} placeholder="Street, City" />
        </div>
        <div>
          <label className={label}>Insurance</label>
          <input name="insurance" className={input} placeholder="Provider #ID" />
        </div>
        <div>
          <label className={label}>Emergency contact</label>
          <input name="emergencyPhone" className={input} placeholder="555-0000" />
        </div>
        <div className="sm:col-span-2">
          <label className={label}>Notes</label>
          <textarea name="notes" rows={2} className={input} placeholder="Allergies, conditions…" />
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
          {saving ? 'Saving…' : 'Register patient'}
        </button>
      </div>
    </form>
  )
}
