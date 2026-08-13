'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Patient = { id: string; name: string }
type Doctor = { id: string; user: { name: string }; specialization: string }

export default function AppointmentForm({
  patients,
  doctors,
  onDone,
}: {
  patients: Patient[]
  doctors: Doctor[]
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

    const res = await fetch('/api/appointments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      setError('Failed to schedule appointment.')
      setSaving(false)
      return
    }

    router.refresh()
    onDone?.()
  }

  const input =
    'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/30'
  const label = 'mb-1 block text-sm font-medium text-gray-700'
  const today = new Date().toISOString().slice(0, 10)

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
          <label className={label}>Doctor *</label>
          <select name="doctorId" required className={input} defaultValue="">
            <option value="" disabled>
              Select doctor
            </option>
            {doctors.map((d) => (
              <option key={d.id} value={d.id}>
                {d.user.name} · {d.specialization}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={label}>Date *</label>
          <input name="date" type="date" required min={today} className={input} />
        </div>
        <div>
          <label className={label}>Time *</label>
          <input name="time" type="time" required className={input} />
        </div>
        <div className="sm:col-span-2">
          <label className={label}>Reason</label>
          <input name="reason" className={input} placeholder="Reason for visit" />
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
          {saving ? 'Scheduling…' : 'Schedule appointment'}
        </button>
      </div>
    </form>
  )
}
