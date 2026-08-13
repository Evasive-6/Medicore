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

  const totals = [
    { label: filter === 'ALL' ? 'Total (all)' : `Total (${filter.toLowerCase()})`, value: `$${total.toFixed(2)}`, accent: 'from-teal-400/25 to-cyan-400/10', text: 'text-white' },
    { label: 'Collected', value: `$${collected.toFixed(2)}`, accent: 'from-emerald-400/25 to-teal-400/10', text: 'text-emerald-300' },
    { label: 'Outstanding', value: `$${outstanding.toFixed(2)}`, accent: 'from-amber-400/25 to-orange-400/10', text: 'text-amber-300' },
  ]

  return (
    <div>
      <PageHeader
        title="Billing & Payments"
        subtitle={`${invoices.length} invoices · $${collected.toFixed(2)} collected`}
        action={
          <button onClick={() => setOpen(true)} className="btn-primary">
            + New invoice
          </button>
        }
      />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {totals.map((t, i) => (
          <div
            key={t.label}
            className={`glass-card glass-card-hover animate-fade-up relative overflow-hidden rounded-2xl p-4`}
            style={{ animationDelay: `${i * 0.08}s` }}
          >
            <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${t.accent} opacity-50`} aria-hidden />
            <p className="relative text-xs uppercase tracking-wider text-slate-400">{t.label}</p>
            <p className={`relative font-display text-2xl font-bold ${t.text}`}>{t.value}</p>
          </div>
        ))}
      </div>

      <div className="mb-4 flex animate-fade-up flex-wrap gap-2">
        {['ALL', ...statuses].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-200 ${
              filter === s
                ? 'bg-gradient-to-r from-teal-400 to-cyan-500 text-[#03131a] shadow-[0_0_16px_rgba(45,212,191,0.4)]'
                : 'border border-white/10 bg-white/[0.03] text-slate-400 hover:border-teal-400/30 hover:text-slate-200'
            }`}
          >
            {s === 'ALL' ? 'All' : s.toLowerCase()}
          </button>
        ))}
      </div>

      <div className="fut-table animate-fade-up">
        <table>
          <thead>
            <tr>
              <th>Patient</th>
              <th>Items</th>
              <th>Doctor</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filtered.map((inv) => (
              <tr key={inv.id}>
                <td>
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-amber-400/25 to-orange-400/15 text-xs font-bold text-amber-200">
                      {inv.patient.name.charAt(0)}
                    </div>
                    <span className="font-medium text-slate-100">{inv.patient.name}</span>
                  </div>
                </td>
                <td className="max-w-xs truncate">{inv.items}</td>
                <td>{inv.appointment?.doctor.user.name ?? '—'}</td>
                <td>
                  <span className="font-display font-bold text-white">${inv.amount.toFixed(2)}</span>
                </td>
                <td>
                  <StatusBadge status={inv.status} />
                </td>
                <td>{new Date(inv.createdAt).toLocaleDateString()}</td>
                <td>
                  <select
                    value={inv.status}
                    onChange={(e) => updateStatus(inv.id, e.target.value)}
                    className="fut-select"
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
                <td colSpan={7} className="py-10 text-center text-slate-500">
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
