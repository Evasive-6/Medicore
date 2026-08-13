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
    <div className="animate-fade-up">
      <Link href="/patients" className="mb-4 inline-block text-sm font-medium text-teal-300 transition hover:text-teal-200 hover:underline">
        ← Back to patients
      </Link>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="title-page text-3xl">{patient.name}</h1>
          <p className="mt-1 text-sm text-slate-400">
            <span className="mr-2 inline-block h-1.5 w-1.5 animate-pulse-glow rounded-full bg-teal-400 align-middle" />
            Registered {new Date(patient.createdAt).toLocaleDateString()}
          </p>
        </div>
        {patient.notes && (
          <div className="max-w-sm rounded-xl border border-amber-400/20 bg-amber-400/10 px-4 py-2 text-sm text-amber-200">
            <span className="font-semibold">Notes:</span> {patient.notes}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-1">
          <section className="glass-card glass-card-hover rounded-2xl p-5">
            <h2 className="mb-4 font-display font-semibold text-white">Patient Info</h2>
            <dl className="space-y-3">
              {info.map((row) => (
                <div key={row.label} className="flex justify-between gap-4 text-sm">
                  <dt className="text-slate-400">{row.label}</dt>
                  <dd className="text-right font-medium text-slate-100">{row.value}</dd>
                </div>
              ))}
            </dl>
          </section>
        </div>

        <div className="space-y-6 lg:col-span-2">
          <section className="glass-card rounded-2xl p-5">
            <h2 className="mb-4 font-display font-semibold text-white">Appointment History</h2>
            <div className="space-y-2.5">
              {patient.appointments.length === 0 && <p className="py-4 text-center text-sm text-slate-500">No appointments yet.</p>}
              {patient.appointments.map((a) => (
                <div key={a.id} className="panel-row flex items-center justify-between px-3 py-2.5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-400/25 to-cyan-400/15 text-xs font-bold text-blue-200">
                      {a.doctor.user.name.replace('Dr. ', '').charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-100">{a.doctor.user.name}</p>
                      <p className="text-xs text-slate-400">
                        <span className="font-mono text-teal-300/80">{a.date} {a.time}</span>
                        {a.reason ? ` · ${a.reason}` : ''}
                      </p>
                    </div>
                  </div>
                  <StatusBadge status={a.status} />
                </div>
              ))}
            </div>
          </section>

          <section className="glass-card rounded-2xl p-5">
            <h2 className="mb-4 font-display font-semibold text-white">Prescriptions</h2>
            <div className="space-y-3">
              {patient.prescriptions.length === 0 && <p className="py-4 text-center text-sm text-slate-500">No prescriptions yet.</p>}
              {patient.prescriptions.map((rx) => (
                <div key={rx.id} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-100">{rx.doctor.user.name}</p>
                    <p className="text-xs text-slate-400">{new Date(rx.createdAt).toLocaleDateString()}</p>
                  </div>
                  {rx.diagnosis && <p className="mb-2 text-xs text-slate-400">Diagnosis: {rx.diagnosis}</p>}
                  <ul className="space-y-1.5">
                    {rx.items.map((item) => (
                      <li key={item.id} className="flex justify-between text-sm">
                        <span className="text-slate-200">💊 {item.medicine.name}</span>
                        <span className="font-mono text-xs text-slate-400">
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
            <section className="glass-card glass-card-hover rounded-2xl p-5">
              <h2 className="mb-4 font-display font-semibold text-white">Lab Orders</h2>
              <div className="space-y-2.5">
                {patient.labOrders.length === 0 && <p className="py-4 text-center text-sm text-slate-500">No lab orders.</p>}
                {patient.labOrders.map((o) => (
                  <div key={o.id} className="panel-row px-3 py-2.5">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-slate-100">{o.test.name}</p>
                      <StatusBadge status={o.status} />
                    </div>
                    {o.result && <p className="mt-1 text-xs text-slate-400">{o.result}</p>}
                  </div>
                ))}
              </div>
            </section>

            <section className="glass-card glass-card-hover rounded-2xl p-5">
              <h2 className="mb-4 font-display font-semibold text-white">Billing</h2>
              <div className="space-y-2.5">
                {patient.invoices.length === 0 && <p className="py-4 text-center text-sm text-slate-500">No invoices.</p>}
                {patient.invoices.map((inv) => (
                  <div key={inv.id} className="panel-row flex items-center justify-between px-3 py-2.5">
                    <div>
                      <p className="font-display text-sm font-bold text-white">${inv.amount.toFixed(2)}</p>
                      <p className="text-xs text-slate-400">{inv.items}</p>
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
