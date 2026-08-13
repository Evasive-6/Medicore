'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import PageHeader from '@/components/ui/PageHeader'
import Modal from '@/components/ui/Modal'
import MedicineForm from '@/components/forms/MedicineForm'

type Medicine = {
  id: string
  name: string
  category: string
  manufacturer: string | null
  price: number
  stock: number
  unit: string
  expiryDate: string | null
}

export default function PharmacyPage() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [medicines, setMedicines] = useState<Medicine[]>([])
  const [query, setQuery] = useState('')
  const [adjust, setAdjust] = useState<Medicine | null>(null)
  const [adjustValue, setAdjustValue] = useState(0)

  async function load() {
    const data = await fetch('/api/medicines').then((r) => r.json())
    setMedicines(data)
  }

  useEffect(() => {
    load()
  }, [])

  useEffect(() => {
    load()
  }, [open])

  async function saveStock(m: Medicine) {
    await fetch('/api/medicines', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: m.id, stock: adjustValue }),
    })
    setAdjust(null)
    router.refresh()
    load()
  }

  const filtered = medicines.filter((m) =>
    `${m.name} ${m.category} ${m.manufacturer ?? ''}`.toLowerCase().includes(query.toLowerCase())
  )

  const lowStockCount = medicines.filter((m) => m.stock < 100).length

  return (
    <div>
      <PageHeader
        title="Pharmacy Inventory"
        subtitle={`${medicines.length} medicines · ${lowStockCount} low stock`}
        action={
          <button onClick={() => setOpen(true)} className="btn-primary">
            + Add medicine
          </button>
        }
      />

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search medicines…"
        className="input mb-4 w-full max-w-sm"
      />

      <div className="fut-table">
        <table>
          <thead>
            <tr>
              <th>Medicine</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Expiry</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filtered.map((m) => (
              <tr key={m.id}>
                <td>
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] text-lg">
                      💊
                    </div>
                    <div>
                      <p className="font-medium text-slate-100">{m.name}</p>
                      {m.manufacturer && <p className="text-xs text-slate-500">{m.manufacturer}</p>}
                    </div>
                  </div>
                </td>
                <td>{m.category}</td>
                <td>
                  <span className="font-display font-semibold text-white">${m.price.toFixed(2)}</span>
                </td>
                <td>
                  <span
                    className={`chip ${
                      m.stock < 50 ? 'chip-red' : m.stock < 100 ? 'chip-amber' : 'chip-emerald'
                    }`}
                  >
                    {m.stock} {m.unit}
                  </span>
                </td>
                <td>{m.expiryDate ? new Date(m.expiryDate).toLocaleDateString() : '—'}</td>
                <td>
                  <button
                    onClick={() => {
                      setAdjust(m)
                      setAdjustValue(m.stock)
                    }}
                    className="btn-ghost px-3 py-1 text-xs"
                  >
                    Adjust stock
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="py-10 text-center text-slate-500">
                  No medicines found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal title="Add medicine" open={open} onClose={() => setOpen(false)}>
        <MedicineForm onDone={() => setOpen(false)} />
      </Modal>

      <Modal title={`Adjust stock — ${adjust?.name ?? ''}`} open={!!adjust} onClose={() => setAdjust(null)}>
        {adjust && (
          <div className="space-y-4">
            <p className="text-sm text-slate-400">
              Current stock: <span className="font-semibold text-white">{adjust.stock} {adjust.unit}</span>
            </p>
            <label className="input-label">New stock level</label>
            <input
              type="number"
              min="0"
              value={adjustValue}
              onChange={(e) => setAdjustValue(Number(e.target.value))}
              className="input"
            />
            <div className="flex justify-end gap-3">
              <button onClick={() => setAdjust(null)} className="btn-ghost">
                Cancel
              </button>
              <button onClick={() => saveStock(adjust)} className="btn-primary">
                Save
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
