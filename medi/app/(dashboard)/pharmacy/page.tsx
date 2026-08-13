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
        title="Pharmacy"
        subtitle={`${medicines.length} medicines in inventory · ${lowStockCount} low stock`}
        action={
          <button
            onClick={() => setOpen(true)}
            className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-700"
          >
            + Add medicine
          </button>
        }
      />

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search medicines…"
        className="mb-4 w-full max-w-sm rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/30"
      />

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gray-100 bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-3 font-medium">Medicine</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Price</th>
              <th className="px-4 py-3 font-medium">Stock</th>
              <th className="px-4 py-3 font-medium">Expiry</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((m) => (
              <tr key={m.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <p className="font-medium text-gray-900">{m.name}</p>
                  {m.manufacturer && <p className="text-xs text-gray-400">{m.manufacturer}</p>}
                </td>
                <td className="px-4 py-3 text-gray-600">{m.category}</td>
                <td className="px-4 py-3 text-gray-600">${m.price.toFixed(2)}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      m.stock < 50
                        ? 'bg-red-100 text-red-700'
                        : m.stock < 100
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-emerald-100 text-emerald-700'
                    }`}
                  >
                    {m.stock} {m.unit}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {m.expiryDate ? new Date(m.expiryDate).toLocaleDateString() : '—'}
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => {
                      setAdjust(m)
                      setAdjustValue(m.stock)
                    }}
                    className="rounded-lg border border-gray-200 px-3 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50"
                  >
                    Adjust stock
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-gray-400">
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
            <p className="text-sm text-gray-500">
              Current stock: <span className="font-semibold text-gray-900">{adjust.stock} {adjust.unit}</span>
            </p>
            <label className="mb-1 block text-sm font-medium text-gray-700">New stock level</label>
            <input
              type="number"
              min="0"
              value={adjustValue}
              onChange={(e) => setAdjustValue(Number(e.target.value))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/30"
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setAdjust(null)}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => saveStock(adjust)}
                className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700"
              >
                Save
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
