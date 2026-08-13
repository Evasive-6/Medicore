'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import PageHeader from '@/components/ui/PageHeader'
import Modal from '@/components/ui/Modal'
import PatientForm from '@/components/forms/PatientForm'

type Patient = {
  id: string
  name: string
  email: string | null
  phone: string
  gender: string
  dateOfBirth: string | null
  bloodGroup: string | null
  address: string | null
  insurance: string | null
  emergencyPhone: string | null
  notes: string | null
  createdAt: string
}

export default function PatientsPage() {
  const [open, setOpen] = useState(false)
  const [patients, setPatients] = useState<Patient[]>([])
  const [query, setQuery] = useState('')

  useEffect(() => {
    fetch('/api/patients')
      .then((r) => r.json())
      .then(setPatients)
  }, [open])

  const filtered = patients.filter((p) =>
    `${p.name} ${p.phone} ${p.email ?? ''}`.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <div>
      <PageHeader
        title="Patient Registry"
        subtitle={`${patients.length} registered patients`}
        action={
          <button onClick={() => setOpen(true)} className="btn-primary">
            + Register patient
          </button>
        }
      />

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search patients…"
        className="input mb-4 w-full max-w-sm"
      />

      <div className="fut-table">
        <table>
          <thead>
            <tr>
              <th>Patient</th>
              <th>Gender</th>
              <th>Blood</th>
              <th>Phone</th>
              <th>Insurance</th>
              <th>Registered</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filtered.map((p) => (
              <tr key={p.id}>
                <td>
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-teal-400/30 to-cyan-400/15 text-xs font-bold text-teal-200">
                      {p.name.charAt(0)}
                    </div>
                    <Link href={`/patients/${p.id}`} className="font-medium text-teal-300 transition hover:text-teal-200 hover:underline">
                      {p.name}
                    </Link>
                  </div>
                </td>
                <td className="capitalize">{p.gender.toLowerCase()}</td>
                <td>{p.bloodGroup?.replace('_', ' ') || '—'}</td>
                <td>{p.phone}</td>
                <td>{p.insurance || '—'}</td>
                <td>{new Date(p.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="py-10 text-center text-slate-500">
                  No patients found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal title="Register new patient" open={open} onClose={() => setOpen(false)}>
        <PatientForm onDone={() => setOpen(false)} />
      </Modal>
    </div>
  )
}
