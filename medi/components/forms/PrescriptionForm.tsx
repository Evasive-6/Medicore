'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Patient = { id: string; name: string }
type Doctor = { id: string; user: { name: string } }
type Medicine = { id: string; name: string; price: number; stock: number }

type ItemRow = {
  medicineId: string
  dosage: string
  frequency: string
  duration: string
}

const emptyItem: ItemRow = { medicineId: '', dosage: '', frequency: '', duration: '' }

export default function PrescriptionForm({
  patients,
  doctors,
  medicines,
  onDone,
}: {
  patients: Patient[]
  doctors: Doctor[]
  medicines: Medicine[]
  onDone?: () => void
}) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [items, setItems] = useState<ItemRow[]>([{ ...emptyItem }])

  function updateItem(index: number, patch: Partial<ItemRow>) {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, ...patch } : item)))
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')

    const validItems = items.filter((item) => item.medicineId && item.dosage && item.frequency)
    if (validItems.length === 0) {
      setError('Add at least one medicine with dosage and frequency.')
      return
    }

    const form = new FormData(e.currentTarget)
    setSaving(true)

    const res = await fetch('/api/prescriptions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        patientId: form.get('patientId'),
        doctorId: form.get('doctorId'),
        diagnosis: form.get('diagnosis'),
        notes: form.get('notes'),
        items: validItems,
      }),
    })

    if (!res.ok) {
      setError('Failed to create prescription.')
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
          <label className={label}>Prescribed by *</label>
          <select name="doctorId" required className={input} defaultValue="">
            <option value="" disabled>
              Select doctor
            </option>
            {doctors.map((d) => (
              <option key={d.id} value={d.id}>
                {d.user.name}
              </option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className={label}>Diagnosis</label>
          <input name="diagnosis" className={input} placeholder="e.g. Acute bronchitis" />
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className={label}>Medicines *</label>
          <button
            type="button"
            onClick={() => setItems((prev) => [...prev, { ...emptyItem }])}
            className="btn-ghost px-3 py-1 text-xs"
          >
            + Add medicine
          </button>
        </div>
        <div className="space-y-3">
          {items.map((item, index) => (
            <div key={index} className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Medicine {index + 1}
                </p>
                {items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setItems((prev) => prev.filter((_, i) => i !== index))}
                    className="text-xs text-red-300 transition hover:text-red-200"
                  >
                    Remove
                  </button>
                )}
              </div>
              <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="col-span-2">
                  <select
                    value={item.medicineId}
                    onChange={(e) => updateItem(index, { medicineId: e.target.value })}
                    className={input}
                    required
                  >
                    <option value="" disabled>
                      Select medicine
                    </option>
                    {medicines.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} · ${m.price.toFixed(2)}
                      </option>
                    ))}
                  </select>
                </div>
                <input
                  value={item.dosage}
                  onChange={(e) => updateItem(index, { dosage: e.target.value })}
                  className={input}
                  placeholder="Dosage (500mg)"
                  required
                />
                <input
                  value={item.frequency}
                  onChange={(e) => updateItem(index, { frequency: e.target.value })}
                  className={input}
                  placeholder="Frequency (3x/day)"
                  required
                />
                <input
                  value={item.duration}
                  onChange={(e) => updateItem(index, { duration: e.target.value })}
                  className={`${input} col-span-2 sm:col-span-4`}
                  placeholder="Duration (7 days) — optional"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <label className={label}>Notes</label>
        <textarea name="notes" rows={2} className={input} placeholder="Take after meals, complete full course…" />
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
          {saving ? 'Creating…' : 'Create prescription'}
        </button>
      </div>
    </form>
  )
}
