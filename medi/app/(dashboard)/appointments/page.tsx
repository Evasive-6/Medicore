'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import PageHeader from '@/components/ui/PageHeader'
import Modal from '@/components/ui/Modal'
import StatusBadge from '@/components/ui/StatusBadge'
import AppointmentForm from '@/components/forms/AppointmentForm'

type Appointment = {
  id: string
  date: string
  time: string
  status: string
  reason: string | null
  patient: { id: string; name: string }
  doctor: { id: string; user: { name: string }; specialization: string }
}
type Patient = { id: string; name: string }
type Doctor = { id: string; user: { name: string }; specialization: string }

const statuses = ['SCHEDULED', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW']

export default function AppointmentsPage() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [patients, setPatients] = useState<Patient[]>([])
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [filter, setFilter] = useState('ALL')

  async function load() {
    const [apps, pats, docs] = await Promise.all([
      fetch('/api/appointments').then((r) => r.json()),
      fetch('/api/patients').then((r) => r.json()),
      fetch('/api/doctors').then((r) => r.json()),
    ])
    setAppointments(apps)
    setPatients(pats)
    setDoctors(docs)
  }

  useEffect(() => {
    load()
  }, [])

  useEffect(() => {
    load()
  }, [open])

  async function updateStatus(id: string, status: string) {
    await fetch('/api/appointments', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    })
    router.refresh()
    load()
  }

  const filtered = filter === 'ALL' ? appointments : appointments.filter((a) => a.status === filter)

  return (
    <div>
      <PageHeader
        title="Appointment Schedule"
        subtitle={`${appointments.length} total appointments`}
        action={
          <button onClick={() => setOpen(true)} className="btn-primary">
            + Schedule appointment
          </button>
        }
      />

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
            {s === 'ALL' ? 'All' : s.replace('_', ' ')}
          </button>
        ))}
      </div>

      <div className="fut-table animate-fade-up">
        <table>
          <thead>
            <tr>
              <th>Patient</th>
              <th>Doctor</th>
              <th>Date</th>
              <th>Time</th>
              <th>Reason</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filtered.map((a) => (
              <tr key={a.id}>
                <td>
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-teal-400/30 to-cyan-400/15 text-xs font-bold text-teal-200">
                      {a.patient.name.charAt(0)}
                    </div>
                    <span className="font-medium text-slate-100">{a.patient.name}</span>
                  </div>
                </td>
                <td>{a.doctor.user.name}</td>
                <td>
                  <span className="font-mono text-teal-300/80">{a.date}</span>
                </td>
                <td>{a.time}</td>
                <td>{a.reason || '—'}</td>
                <td>
                  <StatusBadge status={a.status} />
                </td>
                <td>
                  <select
                    value={a.status}
                    onChange={(e) => updateStatus(a.id, e.target.value)}
                    className="fut-select"
                  >
                    {statuses.map((s) => (
                      <option key={s} value={s}>
                        {s.replace('_', ' ')}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="py-10 text-center text-slate-500">
                  No appointments found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal title="Schedule appointment" open={open} onClose={() => setOpen(false)}>
        <AppointmentForm patients={patients} doctors={doctors} onDone={() => setOpen(false)} />
      </Modal>
    </div>
  )
}
