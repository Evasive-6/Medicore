'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Patient = { id: string; name: string }
type Doctor = { id: string; user: { name: string } }
type LabTest = { id: string; name: string; category: string; price: number }

export default function LabOrderForm({
  patients,
  doctors,
  tests,
  onDone,
}: {
  patients: Patient[]
  doctors: Doctor[]
  tests: LabTest[]
  onDone?: () => void
}) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    setError('')

    const form = new FormData(e.currentTarget)
    const payload = Object.fromEntries(form.entries())

    const res = await fetch('/api/lab', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      setError('Failed to create lab order.')
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
          <label className={label}>Patient *</label>
          <select name="patientId" required className={input} defaultValue="">
            <option value="" disabled>
              Select patient
            </option>
            {patients.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={label}>Ordering doctor</label>
          <select name="doctorId" className={input} defaultValue="">
            <option value="">—</option>
            {doctors.map((d) => (
              <option key={d.id} value={d.id}>
                {d.user.name}
              </option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className={label}>Test *</label>
          <select name="testId" required className={input} defaultValue="">
            <option value="" disabled>
              Select test
            </option>
            {tests.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} · {t.category} · ${t.price.toFixed(2)}
              </option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className={label}>Notes</label>
          <textarea name="notes" rows={2} className={input} placeholder="Fasting required, etc." />
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
          {saving ? 'Creating…' : 'Create order'}
        </button>
      </div>
    </form>
  )
}
