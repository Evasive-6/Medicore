'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import PageHeader from '@/components/ui/PageHeader'
import Modal from '@/components/ui/Modal'
import PrescriptionForm from '@/components/forms/PrescriptionForm'

type Prescription = {
  id: string
  diagnosis: string | null
  notes: string | null
  createdAt: string
  patient: { id: string; name: string }
  doctor: { user: { name: string } }
  items: {
    id: string
    dosage: string
    frequency: string
    duration: string | null
    medicine: { name: string; price: number }
  }[]
}
type Patient = { id: string; name: string }
type Doctor = { id: string; user: { name: string } }
type Medicine = { id: string; name: string; price: number; stock: number }

export default function PrescriptionsPage() {
  const [open, setOpen] = useState(false)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [patients, setPatients] = useState<Patient[]>([])
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [medicines, setMedicines] = useState<Medicine[]>([])

  async function load() {
    const [rxs, pats, docs, meds] = await Promise.all([
      fetch('/api/prescriptions').then((r) => r.json()),
      fetch('/api/patients').then((r) => r.json()),
      fetch('/api/doctors').then((r) => r.json()),
      fetch('/api/medicines').then((r) => r.json()),
    ])
    setPrescriptions(rxs)
    setPatients(pats)
    setDoctors(docs)
    setMedicines(meds)
  }

  useEffect(() => {
    load()
  }, [])

  useEffect(() => {
    load()
  }, [open])

  return (
    <div>
      <PageHeader
        title="Prescriptions"
        subtitle={`${prescriptions.length} prescriptions on record`}
        action={
          <button onClick={() => setOpen(true)} className="btn-primary">
            + New prescription
          </button>
        }
      />

      <div className="space-y-3">
        {prescriptions.length === 0 && (
          <div className="glass-card rounded-2xl py-10 text-center text-sm text-slate-500 animate-fade-up">
            No prescriptions yet.
          </div>
        )}
        {prescriptions.map((rx, i) => {
          const isOpen = expanded === rx.id
          return (
            <div
              key={rx.id}
              className="glass-card glass-card-hover animate-fade-up overflow-hidden rounded-2xl"
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <button
                onClick={() => setExpanded(isOpen ? null : rx.id)}
                className="flex w-full flex-wrap items-center justify-between gap-3 px-5 py-4 text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-400/30 to-cyan-400/15 text-lg">
                    💊
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-100">{rx.patient.name}</p>
                    <p className="text-xs text-slate-400">
                      {rx.doctor.user.name} · {new Date(rx.createdAt).toLocaleDateString()} ·{' '}
                      <span className="font-mono text-teal-300/80">{rx.items.length} med{rx.items.length === 1 ? '' : 's'}</span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {rx.diagnosis && (
                    <span className="chip hidden sm:inline-block">{rx.diagnosis}</span>
                  )}
                  <span className={`text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
                    ▾
                  </span>
                </div>
              </button>

              {isOpen && (
                <div className="animate-fade-in border-t border-white/5 px-5 pb-5 pt-4">
                  <ul className="space-y-2.5">
                    {rx.items.map((item) => (
                      <li key={item.id} className="panel-row flex flex-wrap items-center justify-between gap-2 px-3 py-2.5">
                        <div>
                          <p className="text-sm font-medium text-slate-100">💊 {item.medicine.name}</p>
                          <p className="font-mono text-xs text-slate-400">
                            {item.dosage} · {item.frequency}
                            {item.duration ? ` · ${item.duration}` : ''}
                          </p>
                        </div>
                        <span className="text-xs font-semibold text-teal-300">${item.medicine.price.toFixed(2)}</span>
                      </li>
                    ))}
                  </ul>
                  {(rx.notes || rx.diagnosis) && (
                    <div className="mt-4 space-y-1.5 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
                      {rx.diagnosis && (
                        <p className="text-xs text-slate-300">
                          <span className="font-semibold uppercase tracking-wider text-slate-500">Diagnosis:</span>{' '}
                          {rx.diagnosis}
                        </p>
                      )}
                      {rx.notes && (
                        <p className="text-xs text-slate-300">
                          <span className="font-semibold uppercase tracking-wider text-slate-500">Notes:</span> {rx.notes}
                        </p>
                      )}
                    </div>
                  )}
                  <Link
                    href={`/patients/${rx.patient.id}`}
                    className="mt-4 inline-block text-sm font-medium text-teal-300 transition hover:text-teal-200 hover:underline"
                  >
                    View patient record →
                  </Link>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <Modal title="New prescription" open={open} onClose={() => setOpen(false)}>
        <PrescriptionForm patients={patients} doctors={doctors} medicines={medicines} onDone={() => setOpen(false)} />
      </Modal>
    </div>
  )
}
