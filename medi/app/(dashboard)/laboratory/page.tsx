'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import PageHeader from '@/components/ui/PageHeader'
import Modal from '@/components/ui/Modal'
import StatusBadge from '@/components/ui/StatusBadge'
import LabOrderForm from '@/components/forms/LabOrderForm'

type LabOrder = {
  id: string
  status: string
  result: string | null
  notes: string | null
  createdAt: string
  patient: { name: string }
  doctor: { user: { name: string } } | null
  test: { name: string; category: string }
}
type Patient = { id: string; name: string }
type Doctor = { id: string; user: { name: string } }
type LabTest = { id: string; name: string; category: string; price: number }

const statuses = ['PENDING', 'SAMPLE_COLLECTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']

export default function LaboratoryPage() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [orders, setOrders] = useState<LabOrder[]>([])
  const [patients, setPatients] = useState<Patient[]>([])
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [tests, setTests] = useState<LabTest[]>([])
  const [resultFor, setResultFor] = useState<LabOrder | null>(null)
  const [resultText, setResultText] = useState('')

  async function load() {
    const [ords, pats, docs, tests] = await Promise.all([
      fetch('/api/lab').then((r) => r.json()),
      fetch('/api/patients').then((r) => r.json()),
      fetch('/api/doctors').then((r) => r.json()),
      fetch('/api/lab/tests').then((r) => r.json()),
    ])
    setOrders(ords)
    setPatients(pats)
    setDoctors(docs)
    setTests(tests)
  }

  useEffect(() => {
    load()
  }, [])

  useEffect(() => {
    load()
  }, [open])

  async function updateStatus(id: string, status: string) {
    await fetch('/api/lab', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    })
    router.refresh()
    load()
  }

  async function saveResult() {
    if (!resultFor) return
    await fetch('/api/lab', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: resultFor.id, result: resultText, status: 'COMPLETED' }),
    })
    setResultFor(null)
    router.refresh()
    load()
  }

  return (
    <div>
      <PageHeader
        title="Laboratory"
        subtitle={`${orders.length} lab orders`}
        action={
          <button
            onClick={() => setOpen(true)}
            className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-700"
          >
            + New lab order
          </button>
        }
      />

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gray-100 bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-3 font-medium">Patient</th>
              <th className="px-4 py-3 font-medium">Test</th>
              <th className="px-4 py-3 font-medium">Ordered By</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Result</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {orders.map((o) => (
              <tr key={o.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{o.patient.name}</td>
                <td className="px-4 py-3">
                  <p className="text-gray-900">{o.test.name}</p>
                  <p className="text-xs text-gray-400">{o.test.category}</p>
                </td>
                <td className="px-4 py-3 text-gray-600">{o.doctor?.user.name ?? '—'}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={o.status} />
                </td>
                <td className="max-w-xs px-4 py-3">
                  {o.result ? (
                    <p className="truncate text-gray-600">{o.result}</p>
                  ) : (
                    <span className="text-gray-300">—</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <select
                      value={o.status}
                      onChange={(e) => updateStatus(o.id, e.target.value)}
                      className="rounded-lg border border-gray-300 bg-white px-2 py-1 text-xs focus:border-teal-500 focus:outline-none"
                    >
                      {statuses.map((s) => (
                        <option key={s} value={s}>
                          {s.replace('_', ' ')}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => {
                        setResultFor(o)
                        setResultText(o.result ?? '')
                      }}
                      className="rounded-lg border border-gray-200 px-3 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50"
                    >
                      Result
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-gray-400">
                  No lab orders yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5">
        <h2 className="mb-4 font-semibold text-gray-900">Available Tests</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {tests.map((t) => (
            <div key={t.id} className="rounded-lg bg-gray-50 p-3">
              <p className="text-sm font-medium text-gray-900">{t.name}</p>
              <p className="text-xs text-gray-500">{t.category} · ${t.price.toFixed(2)}</p>
            </div>
          ))}
        </div>
      </div>

      <Modal title="New lab order" open={open} onClose={() => setOpen(false)}>
        <LabOrderForm patients={patients} doctors={doctors} tests={tests} onDone={() => setOpen(false)} />
      </Modal>

      <Modal title="Enter test result" open={!!resultFor} onClose={() => setResultFor(null)}>
        <div className="space-y-4">
          {resultFor && (
            <p className="text-sm text-gray-500">
              {resultFor.test.name} · {resultFor.patient.name}
            </p>
          )}
          <textarea
            value={resultText}
            onChange={(e) => setResultText(e.target.value)}
            rows={4}
            placeholder="Test findings, values, and interpretation…"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/30"
          />
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setResultFor(null)}
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={saveResult}
              className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700"
            >
              Save result
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
