import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import StatusBadge from '@/components/ui/StatusBadge'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const [
    patientCount,
    doctorCount,
    appointmentCount,
    todayAppointments,
    medicineCount,
    lowStock,
    pendingInvoices,
    revenue,
    recentAppointments,
    recentInvoices,
  ] = await Promise.all([
    prisma.patient.count(),
    prisma.doctor.count(),
    prisma.appointment.count(),
    prisma.appointment.findMany({
      where: { status: { in: ['SCHEDULED', 'CONFIRMED'] } },
      orderBy: { date: 'asc' },
      take: 5,
      include: { patient: true, doctor: { include: { user: true } } },
    }),
    prisma.medicine.count(),
    prisma.medicine.findMany({ where: { stock: { lt: 100 } }, orderBy: { stock: 'asc' } }),
    prisma.invoice.findMany({ where: { status: 'PENDING' } }),
    prisma.invoice.aggregate({ _sum: { amount: true }, where: { status: 'PAID' } }),
    prisma.appointment.findMany({
      orderBy: { createdAt: 'desc' },
      take: 6,
      include: { patient: true, doctor: { include: { user: true } } },
    }),
    prisma.invoice.findMany({ orderBy: { createdAt: 'desc' }, take: 5, include: { patient: true } }),
  ])

  const pendingTotal = pendingInvoices.reduce((sum, i) => sum + i.amount, 0)
  const paidTotal = revenue._sum.amount ?? 0

  const stats = [
    { label: 'Total Patients', value: patientCount, icon: '👥', href: '/patients', color: 'bg-teal-50 text-teal-700' },
    { label: 'Total Doctors', value: doctorCount, icon: '🩺', href: '/doctors', color: 'bg-blue-50 text-blue-700' },
    { label: 'Appointments', value: appointmentCount, icon: '📅', href: '/appointments', color: 'bg-amber-50 text-amber-700' },
    { label: 'Medicines in Stock', value: medicineCount, icon: '💊', href: '/pharmacy', color: 'bg-violet-50 text-violet-700' },
    { label: 'Revenue Collected', value: `$${paidTotal.toFixed(2)}`, icon: '💰', href: '/billing', color: 'bg-emerald-50 text-emerald-700' },
    { label: 'Pending Invoices', value: `$${pendingTotal.toFixed(2)}`, icon: '🧾', href: '/billing', color: 'bg-red-50 text-red-700' },
  ]

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">Overview of hospital operations</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-5 transition hover:shadow-md"
          >
            <div className={`flex h-12 w-12 items-center justify-center rounded-xl text-2xl ${s.color}`}>
              {s.icon}
            </div>
            <div>
              <p className="text-sm text-gray-500">{s.label}</p>
              <p className="text-2xl font-bold text-gray-900">{s.value}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-gray-200 bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Upcoming Appointments</h2>
            <Link href="/appointments" className="text-sm font-medium text-teal-600 hover:text-teal-700">
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {todayAppointments.length === 0 && (
              <p className="py-6 text-center text-sm text-gray-400">No upcoming appointments.</p>
            )}
            {todayAppointments.map((a) => (
              <div key={a.id} className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2.5">
                <div>
                  <p className="text-sm font-medium text-gray-900">{a.patient.name}</p>
                  <p className="text-xs text-gray-500">
                    {a.doctor.user.name} · {a.date} {a.time}
                  </p>
                </div>
                <StatusBadge status={a.status} />
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Low Stock Alerts</h2>
            <Link href="/pharmacy" className="text-sm font-medium text-teal-600 hover:text-teal-700">
              Manage
            </Link>
          </div>
          <div className="space-y-3">
            {lowStock.length === 0 && <p className="py-6 text-center text-sm text-gray-400">All medicines sufficiently stocked.</p>}
            {lowStock.slice(0, 6).map((m) => (
              <div key={m.id} className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2.5">
                <div>
                  <p className="text-sm font-medium text-gray-900">{m.name}</p>
                  <p className="text-xs text-gray-500">{m.category}</p>
                </div>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    m.stock < 50 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                  }`}
                >
                  {m.stock} left
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-gray-200 bg-white p-5">
          <h2 className="mb-4 font-semibold text-gray-900">Recent Appointments</h2>
          <div className="space-y-3">
            {recentAppointments.map((a) => (
              <div key={a.id} className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2.5">
                <div>
                  <p className="text-sm font-medium text-gray-900">{a.patient.name}</p>
                  <p className="text-xs text-gray-500">
                    {a.doctor.user.name} · {a.date} {a.time}
                  </p>
                </div>
                <StatusBadge status={a.status} />
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-5">
          <h2 className="mb-4 font-semibold text-gray-900">Recent Invoices</h2>
          <div className="space-y-3">
            {recentInvoices.map((inv) => (
              <div key={inv.id} className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2.5">
                <div>
                  <p className="text-sm font-medium text-gray-900">{inv.patient.name}</p>
                  <p className="text-xs text-gray-500">{inv.items}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">${inv.amount.toFixed(2)}</p>
                  <StatusBadge status={inv.status} />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
