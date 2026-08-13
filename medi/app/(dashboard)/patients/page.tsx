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
        title="Patients"
        subtitle={`${patients.length} registered patients`}
        action={
          <button
            onClick={() => setOpen(true)}
            className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-700"
          >
            + Register patient
          </button>
        }
      />

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search patients…"
        className="mb-4 w-full max-w-sm rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/30"
      />

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gray-100 bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-3 font-medium">Patient</th>
              <th className="px-4 py-3 font-medium">Gender</th>
              <th className="px-4 py-3 font-medium">Blood</th>
              <th className="px-4 py-3 font-medium">Phone</th>
              <th className="px-4 py-3 font-medium">Insurance</th>
              <th className="px-4 py-3 font-medium">Registered</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <Link href={`/patients/${p.id}`} className="font-medium text-teal-700 hover:underline">
                    {p.name}
                  </Link>
                </td>
                <td className="px-4 py-3 capitalize text-gray-600">{p.gender.toLowerCase()}</td>
                <td className="px-4 py-3 text-gray-600">{p.bloodGroup?.replace('_', ' ') || '—'}</td>
                <td className="px-4 py-3 text-gray-600">{p.phone}</td>
                <td className="px-4 py-3 text-gray-600">{p.insurance || '—'}</td>
                <td className="px-4 py-3 text-gray-500">{new Date(p.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-gray-400">
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
