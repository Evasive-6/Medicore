'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import PageHeader from '@/components/ui/PageHeader'
import Modal from '@/components/ui/Modal'
import StatusBadge from '@/components/ui/StatusBadge'
import InvoiceForm from '@/components/forms/InvoiceForm'

type Invoice = {
  id: string
  amount: number
  status: string
  items: string
  createdAt: string
  patient: { name: string }
  appointment: { doctor: { user: { name: string } } } | null
}
type Patient = { id: string; name: string }
type Appointment = { id: string; patient: { id: string; name: string }; date: string; time: string }

const statuses = ['PAID', 'PENDING', 'OVERDUE', 'REFUNDED']

export default function BillingPage() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [patients, setPatients] = useState<Patient[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [filter, setFilter] = useState('ALL')

  async function load() {
    const [invs, pats, apps] = await Promise.all([
      fetch('/api/invoices').then((r) => r.json()),
      fetch('/api/patients').then((r) => r.json()),
      fetch('/api/appointments').then((r) => r.json()),
    ])
    setInvoices(invs)
    setPatients(pats)
    setAppointments(apps)
  }

  useEffect(() => {
    load()
  }, [])

  useEffect(() => {
    load()
  }, [open])

  async function updateStatus(id: string, status: string) {
    await fetch('/api/invoices', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    })
    router.refresh()
    load()
  }

  const filtered = filter === 'ALL' ? invoices : invoices.filter((i) => i.status === filter)
  const total = filtered.reduce((sum, i) => sum + i.amount, 0)
  const collected = invoices.filter((i) => i.status === 'PAID').reduce((sum, i) => sum + i.amount, 0)
  const outstanding = invoices.filter((i) => i.status === 'PENDING' || i.status === 'OVERDUE').reduce((sum, i) => sum + i.amount, 0)

  return (
    <div>
      <PageHeader
        title="Billing"
        subtitle={`${invoices.length} invoices · $${collected.toFixed(2)} collected`}
        action={
          <button
            onClick={() => setOpen(true)}
            className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-700"
          >
            + New invoice
          </button>
        }
      />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-4">
          <p className="text-sm text-gray-500">Total ({filter === 'ALL' ? 'all' : filter.toLowerCase()})</p>
          <p className="text-2xl font-bold text-gray-900">${total.toFixed(2)}</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-4">
          <p className="text-sm text-gray-500">Collected</p>
          <p className="text-2xl font-bold text-emerald-600">${collected.toFixed(2)}</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-4">
          <p className="text-sm text-gray-500">Outstanding</p>
          <p className="text-2xl font-bold text-amber-600">${outstanding.toFixed(2)}</p>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {['ALL', ...statuses].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
              filter === s ? 'bg-teal-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {s === 'ALL' ? 'All' : s.toLowerCase()}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gray-100 bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-3 font-medium">Patient</th>
              <th className="px-4 py-3 font-medium">Items</th>
              <th className="px-4 py-3 font-medium">Doctor</th>
              <th className="px-4 py-3 font-medium">Amount</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((inv) => (
              <tr key={inv.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{inv.patient.name}</td>
                <td className="max-w-xs truncate px-4 py-3 text-gray-600">{inv.items}</td>
                <td className="px-4 py-3 text-gray-600">{inv.appointment?.doctor.user.name ?? '—'}</td>
                <td className="px-4 py-3 font-semibold text-gray-900">${inv.amount.toFixed(2)}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={inv.status} />
                </td>
                <td className="px-4 py-3 text-gray-500">{new Date(inv.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <select
                    value={inv.status}
                    onChange={(e) => updateStatus(inv.id, e.target.value)}
                    className="rounded-lg border border-gray-300 bg-white px-2 py-1 text-xs focus:border-teal-500 focus:outline-none"
                  >
                    {statuses.map((s) => (
                      <option key={s} value={s}>
                        {s.toLowerCase()}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-gray-400">
                  No invoices found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal title="Create invoice" open={open} onClose={() => setOpen(false)}>
        <InvoiceForm patients={patients} appointments={appointments} onDone={() => setOpen(false)} />
      </Modal>
    </div>
  )
}
