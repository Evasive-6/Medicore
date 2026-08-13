import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import StatusBadge from '@/components/ui/StatusBadge'

export const dynamic = 'force-dynamic'

export default async function PatientDetailPage({ params }: { params: { id: string } }) {
  const patient = await prisma.patient.findUnique({
    where: { id: params.id },
    include: {
      appointments: { include: { doctor: { include: { user: true } } }, orderBy: { date: 'desc' } },
      invoices: { orderBy: { createdAt: 'desc' } },
      labOrders: { include: { test: true }, orderBy: { createdAt: 'desc' } },
      prescriptions: { include: { doctor: { include: { user: true } }, items: { include: { medicine: true } } }, orderBy: { createdAt: 'desc' } },
    },
  })

  if (!patient) notFound()

  const info = [
    { label: 'Email', value: patient.email || '—' },
    { label: 'Phone', value: patient.phone },
    { label: 'Gender', value: patient.gender.toLowerCase() },
    { label: 'Blood group', value: patient.bloodGroup?.replace('_', ' ') || '—' },
    { label: 'Date of birth', value: patient.dateOfBirth ? new Date(patient.dateOfBirth).toLocaleDateString() : '—' },
    { label: 'Address', value: patient.address || '—' },
    { label: 'Insurance', value: patient.insurance || '—' },
    { label: 'Emergency contact', value: patient.emergencyPhone || '—' },
  ]

  return (
    <div>
      <Link href="/patients" className="mb-4 inline-block text-sm font-medium text-teal-600 hover:underline">
        ← Back to patients
      </Link>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{patient.name}</h1>
          <p className="mt-1 text-sm text-gray-500">Registered {new Date(patient.createdAt).toLocaleDateString()}</p>
        </div>
        {patient.notes && (
          <div className="max-w-sm rounded-lg bg-amber-50 px-4 py-2 text-sm text-amber-800">
            <span className="font-semibold">Notes:</span> {patient.notes}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-1">
          <section className="rounded-2xl border border-gray-200 bg-white p-5">
            <h2 className="mb-4 font-semibold text-gray-900">Patient Info</h2>
            <dl className="space-y-3">
              {info.map((row) => (
                <div key={row.label} className="flex justify-between gap-4 text-sm">
                  <dt className="text-gray-500">{row.label}</dt>
                  <dd className="text-right font-medium text-gray-900">{row.value}</dd>
                </div>
              ))}
            </dl>
          </section>
        </div>

        <div className="space-y-6 lg:col-span-2">
          <section className="rounded-2xl border border-gray-200 bg-white p-5">
            <h2 className="mb-4 font-semibold text-gray-900">Appointment History</h2>
            <div className="space-y-2">
              {patient.appointments.length === 0 && <p className="py-4 text-center text-sm text-gray-400">No appointments yet.</p>}
              {patient.appointments.map((a) => (
                <div key={a.id} className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2.5">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{a.doctor.user.name}</p>
                    <p className="text-xs text-gray-500">
                      {a.date} {a.time} {a.reason ? `· ${a.reason}` : ''}
                    </p>
                  </div>
                  <StatusBadge status={a.status} />
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-gray-200 bg-white p-5">
            <h2 className="mb-4 font-semibold text-gray-900">Prescriptions</h2>
            <div className="space-y-3">
              {patient.prescriptions.length === 0 && <p className="py-4 text-center text-sm text-gray-400">No prescriptions yet.</p>}
              {patient.prescriptions.map((rx) => (
                <div key={rx.id} className="rounded-lg border border-gray-100 p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-sm font-semibold text-gray-900">{rx.doctor.user.name}</p>
                    <p className="text-xs text-gray-500">{new Date(rx.createdAt).toLocaleDateString()}</p>
                  </div>
                  {rx.diagnosis && <p className="mb-2 text-xs text-gray-500">Diagnosis: {rx.diagnosis}</p>}
                  <ul className="space-y-1">
                    {rx.items.map((item) => (
                      <li key={item.id} className="flex justify-between text-sm text-gray-600">
                        <span>{item.medicine.name}</span>
                        <span className="text-gray-400">
                          {item.dosage} · {item.frequency}{item.duration ? ` · ${item.duration}` : ''}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <section className="rounded-2xl border border-gray-200 bg-white p-5">
              <h2 className="mb-4 font-semibold text-gray-900">Lab Orders</h2>
              <div className="space-y-2">
                {patient.labOrders.length === 0 && <p className="py-4 text-center text-sm text-gray-400">No lab orders.</p>}
                {patient.labOrders.map((o) => (
                  <div key={o.id} className="rounded-lg bg-gray-50 px-3 py-2.5">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900">{o.test.name}</p>
                      <StatusBadge status={o.status} />
                    </div>
                    {o.result && <p className="mt-1 text-xs text-gray-500">{o.result}</p>}
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-gray-200 bg-white p-5">
              <h2 className="mb-4 font-semibold text-gray-900">Billing</h2>
              <div className="space-y-2">
                {patient.invoices.length === 0 && <p className="py-4 text-center text-sm text-gray-400">No invoices.</p>}
                {patient.invoices.map((inv) => (
                  <div key={inv.id} className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2.5">
                    <div>
                      <p className="text-sm font-medium text-gray-900">${inv.amount.toFixed(2)}</p>
                      <p className="text-xs text-gray-500">{inv.items}</p>
                    </div>
                    <StatusBadge status={inv.status} />
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
