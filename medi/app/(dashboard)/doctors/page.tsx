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
        title="Medical Staff"
        subtitle={`${doctors.length} doctors on staff`}
        action={
          <button onClick={() => setOpen(true)} className="btn-primary">
            + Add doctor
          </button>
        }
      />

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search doctors…"
        className="input mb-4 w-full max-w-sm"
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((d, i) => (
          <div
            key={d.id}
            className="glass-card glass-card-hover animate-fade-up relative overflow-hidden rounded-2xl p-5"
            style={{ animationDelay: `${i * 0.06}s` }}
          >
            <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-gradient-to-br from-teal-400/15 to-cyan-400/5 blur-2xl" aria-hidden />
            <div className="mb-3 flex items-center gap-3">
              <div className="animate-gradient flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-400 to-cyan-500 text-sm font-bold text-[#03131a] shadow-[0_0_20px_rgba(45,212,191,0.3)]">
                {d.user.name.replace('Dr. ', '').split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
              </div>
              <div>
                <p className="font-display font-semibold text-white">{d.user.name}</p>
                <p className="text-xs text-slate-400">{d.user.email}</p>
              </div>
            </div>
            <p className="inline-block rounded-full border border-teal-400/25 bg-teal-400/10 px-2.5 py-0.5 text-xs font-medium text-teal-300">
              {d.specialization}
            </p>
            <div className="mt-3 flex items-center justify-between text-sm text-slate-400">
              <span>{d.experienceYears} yrs experience</span>
              <span className="font-display font-semibold text-white">${d.fee.toFixed(2)} / visit</span>
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-white/5 pt-3">
              <span className="font-mono text-xs text-slate-500">{d.phone}</span>
              <span className={`chip ${d.available ? 'chip-emerald' : 'chip-red'}`}>
                {d.available ? 'Available' : 'Unavailable'}
              </span>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="col-span-full py-10 text-center text-slate-500">No doctors found.</p>
        )}
      </div>

      <Modal title="Add new doctor" open={open} onClose={() => setOpen(false)}>
        <DoctorForm onDone={() => setOpen(false)} />
      </Modal>
    </div>
  )
}
