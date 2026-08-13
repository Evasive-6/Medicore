'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Patient = { id: string; name: string }
type Appointment = { id: string; patient: { id: string; name: string }; date: string; time: string }

export default function InvoiceForm({
  patients,
  appointments,
  onDone,
}: {
  patients: Patient[]
  appointments: Appointment[]
  onDone?: () => void
}) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [patientId, setPatientId] = useState('')

  const patientAppointments = appointments.filter((a) => a.patient.id === patientId)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    setError('')

    const form = new FormData(e.currentTarget)
    const payload = Object.fromEntries(form.entries())

    const res = await fetch('/api/invoices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      setError('Failed to create invoice.')
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
          <select
            name="patientId"
            required
            className={input}
            value={patientId}
            onChange={(e) => setPatientId(e.target.value)}
          >
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
          <label className={label}>Linked appointment</label>
          <select name="appointmentId" className={input} defaultValue="">
            <option value="">None</option>
            {patientAppointments.map((a) => (
              <option key={a.id} value={a.id}>
                {a.date} {a.time}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={label}>Amount ($) *</label>
          <input name="amount" type="number" min="0" step="0.01" required className={input} />
        </div>
        <div>
          <label className={label}>Status</label>
          <select name="status" className={input} defaultValue="PENDING">
            <option value="PENDING">Pending</option>
            <option value="PAID">Paid</option>
            <option value="OVERDUE">Overdue</option>
            <option value="REFUNDED">Refunded</option>
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className={label}>Items description *</label>
          <input name="items" required className={input} placeholder="Consultation, lab tests…" />
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
          {saving ? 'Creating…' : 'Create invoice'}
        </button>
      </div>
    </form>
  )
}
