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
        title="Appointments"
        subtitle={`${appointments.length} total appointments`}
        action={
          <button
            onClick={() => setOpen(true)}
            className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-700"
          >
            + Schedule appointment
          </button>
        }
      />

      <div className="mb-4 flex flex-wrap gap-2">
        {['ALL', ...statuses].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
              filter === s ? 'bg-teal-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {s === 'ALL' ? 'All' : s.replace('_', ' ')}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gray-100 bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-3 font-medium">Patient</th>
              <th className="px-4 py-3 font-medium">Doctor</th>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Time</th>
              <th className="px-4 py-3 font-medium">Reason</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((a) => (
              <tr key={a.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{a.patient.name}</td>
                <td className="px-4 py-3 text-gray-600">{a.doctor.user.name}</td>
                <td className="px-4 py-3 text-gray-600">{a.date}</td>
                <td className="px-4 py-3 text-gray-600">{a.time}</td>
                <td className="px-4 py-3 text-gray-600">{a.reason || '—'}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={a.status} />
                </td>
                <td className="px-4 py-3">
                  <select
                    value={a.status}
                    onChange={(e) => updateStatus(a.id, e.target.value)}
                    className="rounded-lg border border-gray-300 bg-white px-2 py-1 text-xs focus:border-teal-500 focus:outline-none"
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
                <td colSpan={7} className="px-4 py-10 text-center text-gray-400">
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
