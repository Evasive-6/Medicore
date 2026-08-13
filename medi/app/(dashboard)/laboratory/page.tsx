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
          <button onClick={() => setOpen(true)} className="btn-primary">
            + New lab order
          </button>
        }
      />

      <div className="fut-table animate-fade-up">
        <table>
          <thead>
            <tr>
              <th>Patient</th>
              <th>Test</th>
              <th>Ordered By</th>
              <th>Status</th>
              <th>Result</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {orders.map((o) => (
              <tr key={o.id}>
                <td>
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-violet-400/30 to-fuchsia-400/15 text-xs font-bold text-violet-200">
                      {o.patient.name.charAt(0)}
                    </div>
                    <span className="font-medium text-slate-100">{o.patient.name}</span>
                  </div>
                </td>
                <td>
                  <p className="text-slate-100">{o.test.name}</p>
                  <p className="text-xs text-slate-500">{o.test.category}</p>
                </td>
                <td>{o.doctor?.user.name ?? '—'}</td>
                <td>
                  <StatusBadge status={o.status} />
                </td>
                <td className="max-w-xs">
                  {o.result ? (
                    <p className="truncate text-slate-300">{o.result}</p>
                  ) : (
                    <span className="text-slate-600">—</span>
                  )}
                </td>
                <td>
                  <div className="flex items-center gap-2">
                    <select
                      value={o.status}
                      onChange={(e) => updateStatus(o.id, e.target.value)}
                      className="fut-select"
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
                      className="btn-ghost px-3 py-1 text-xs"
                    >
                      Result
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={6} className="py-10 text-center text-slate-500">
                  No lab orders yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-6 glass-card rounded-2xl p-5">
        <h2 className="mb-4 font-display font-semibold text-white">Available Tests</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {tests.map((t) => (
            <div key={t.id} className="panel-row glass-card-hover p-3">
              <p className="text-sm font-medium text-slate-100">{t.name}</p>
              <p className="mt-0.5 text-xs text-slate-400">
                {t.category} · <span className="font-semibold text-teal-300">${t.price.toFixed(2)}</span>
              </p>
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
            <p className="text-sm text-slate-400">
              <span className="text-slate-200">{resultFor.test.name}</span> · {resultFor.patient.name}
            </p>
          )}
          <textarea
            value={resultText}
            onChange={(e) => setResultText(e.target.value)}
            rows={4}
            placeholder="Test findings, values, and interpretation…"
            className="input"
          />
          <div className="flex justify-end gap-3">
            <button onClick={() => setResultFor(null)} className="btn-ghost">
              Cancel
            </button>
            <button onClick={saveResult} className="btn-primary">
              Save result
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
