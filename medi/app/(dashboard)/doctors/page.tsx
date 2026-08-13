'use client'

import { useEffect, useState } from 'react'
import PageHeader from '@/components/ui/PageHeader'
import Modal from '@/components/ui/Modal'
import DoctorForm from '@/components/forms/DoctorForm'

type Doctor = {
  id: string
  specialization: string
  phone: string
  experienceYears: number
  fee: number
  available: boolean
  user: { name: string; email: string }
  _count?: { appointments: number }
}

export default function DoctorsPage() {
  const [open, setOpen] = useState(false)
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [query, setQuery] = useState('')

  useEffect(() => {
    fetch('/api/doctors')
      .then((r) => r.json())
      .then(setDoctors)
  }, [open])

  const filtered = doctors.filter((d) =>
    `${d.user.name} ${d.specialization}`.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <div>
      <PageHeader
        title="Doctors"
        subtitle={`${doctors.length} doctors on staff`}
        action={
          <button
            onClick={() => setOpen(true)}
            className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-700"
          >
            + Add doctor
          </button>
        }
      />

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search doctors…"
        className="mb-4 w-full max-w-sm rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/30"
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((d) => (
          <div key={d.id} className="rounded-2xl border border-gray-200 bg-white p-5">
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-teal-100 text-sm font-bold text-teal-700">
                {d.user.name.replace('Dr. ', '').split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-gray-900">{d.user.name}</p>
                <p className="text-xs text-gray-500">{d.user.email}</p>
              </div>
            </div>
            <p className="text-sm font-medium text-teal-700">{d.specialization}</p>
            <div className="mt-3 flex items-center justify-between text-sm text-gray-500">
              <span>{d.experienceYears} yrs exp</span>
              <span>${d.fee.toFixed(2)} / visit</span>
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3">
              <span className="text-xs text-gray-400">{d.phone}</span>
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  d.available ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                }`}
              >
                {d.available ? 'Available' : 'Unavailable'}
              </span>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="col-span-full py-10 text-center text-gray-400">No doctors found.</p>
        )}
      </div>

      <Modal title="Add new doctor" open={open} onClose={() => setOpen(false)}>
        <DoctorForm onDone={() => setOpen(false)} />
      </Modal>
    </div>
  )
}
