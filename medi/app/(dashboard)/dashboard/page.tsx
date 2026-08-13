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
    { label: 'Total Patients', value: patientCount, icon: '👥', href: '/patients', accent: 'from-teal-400/30 to-emerald-400/10', glow: 'group-hover:shadow-[0_0_30px_rgba(45,212,191,0.25)]' },
    { label: 'Total Doctors', value: doctorCount, icon: '🩺', href: '/doctors', accent: 'from-blue-400/30 to-cyan-400/10', glow: 'group-hover:shadow-[0_0_30px_rgba(34,211,238,0.25)]' },
    { label: 'Appointments', value: appointmentCount, icon: '📅', href: '/appointments', accent: 'from-amber-400/25 to-orange-400/10', glow: 'group-hover:shadow-[0_0_30px_rgba(251,191,36,0.2)]' },
    { label: 'Medicines', value: medicineCount, icon: '💊', href: '/pharmacy', accent: 'from-violet-400/25 to-fuchsia-400/10', glow: 'group-hover:shadow-[0_0_30px_rgba(167,139,250,0.25)]' },
    { label: 'Revenue', value: `$${paidTotal.toFixed(2)}`, icon: '💰', href: '/billing', accent: 'from-emerald-400/25 to-teal-400/10', glow: 'group-hover:shadow-[0_0_30px_rgba(52,211,153,0.25)]' },
    { label: 'Outstanding', value: `$${pendingTotal.toFixed(2)}`, icon: '🧾', href: '/billing', accent: 'from-red-400/25 to-rose-400/10', glow: 'group-hover:shadow-[0_0_30px_rgba(248,113,113,0.2)]' },
  ]

  return (
    <div>
      <div className="mb-8 animate-fade-up">
        <h1 className="title-page text-3xl">
          <span className="text-gradient">Mission Control</span>
        </h1>
        <p className="mt-2 text-sm text-slate-400">Real-time overview of hospital operations</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((s, i) => (
          <Link
            key={s.label}
            href={s.href}
            className={`glass-card glass-card-hover animate-fade-up group relative overflow-hidden p-5 ${s.glow}`}
            style={{ animationDelay: `${i * 0.08}s` }}
          >
            <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${s.accent} opacity-60`} aria-hidden />
            <div className="relative flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] text-2xl transition-transform duration-300 group-hover:scale-110">
                {s.icon}
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-slate-400">{s.label}</p>
                <p className="font-display text-2xl font-bold text-white">{s.value}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="glass-card glass-card-hover animate-fade-up relative overflow-hidden rounded-2xl p-5" style={{ animationDelay: '0.3s' }}>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display font-semibold text-white">Upcoming Appointments</h2>
            <Link href="/appointments" className="text-sm font-medium text-teal-300 transition hover:text-teal-200 hover:underline">
              View all →
            </Link>
          </div>
          <div className="space-y-2.5">
            {todayAppointments.length === 0 && (
              <p className="py-6 text-center text-sm text-slate-500">No upcoming appointments.</p>
            )}
            {todayAppointments.map((a, i) => (
              <div key={a.id} className="panel-row flex animate-fade-up items-center justify-between px-3 py-2.5" style={{ animationDelay: `${0.35 + i * 0.06}s` }}>
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-teal-400/30 to-cyan-400/20 text-xs font-bold text-teal-200">
                    {a.patient.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-100">{a.patient.name}</p>
                    <p className="text-xs text-slate-400">
                      {a.doctor.user.name} · <span className="font-mono text-teal-300/80">{a.date} {a.time}</span>
                    </p>
                  </div>
                </div>
                <StatusBadge status={a.status} />
              </div>
            ))}
          </div>
        </section>

        <section className="glass-card glass-card-hover animate-fade-up relative overflow-hidden rounded-2xl p-5" style={{ animationDelay: '0.4s' }}>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display font-semibold text-white">Inventory Alerts</h2>
            <Link href="/pharmacy" className="text-sm font-medium text-teal-300 transition hover:text-teal-200 hover:underline">
              Manage →
            </Link>
          </div>
          <div className="space-y-2.5">
            {lowStock.length === 0 && <p className="py-6 text-center text-sm text-slate-500">All medicines sufficiently stocked.</p>}
            {lowStock.slice(0, 6).map((m, i) => (
              <div key={m.id} className="panel-row flex animate-fade-up items-center justify-between px-3 py-2.5" style={{ animationDelay: `${0.45 + i * 0.06}s` }}>
                <div>
                  <p className="text-sm font-medium text-slate-100">{m.name}</p>
                  <p className="text-xs text-slate-400">{m.category}</p>
                </div>
                <span
                  className={`chip ${m.stock < 50 ? 'chip-red' : 'chip-amber'}`}
                >
                  {m.stock} left
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="glass-card glass-card-hover animate-fade-up rounded-2xl p-5" style={{ animationDelay: '0.5s' }}>
          <h2 className="mb-4 font-display font-semibold text-white">Recent Appointments</h2>
          <div className="space-y-2.5">
            {recentAppointments.map((a) => (
              <div key={a.id} className="panel-row flex items-center justify-between px-3 py-2.5">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-violet-400/30 to-fuchsia-400/20 text-xs font-bold text-violet-200">
                    {a.patient.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-100">{a.patient.name}</p>
                    <p className="text-xs text-slate-400">
                      {a.doctor.user.name} · {a.date} {a.time}
                    </p>
                  </div>
                </div>
                <StatusBadge status={a.status} />
              </div>
            ))}
          </div>
        </section>

        <section className="glass-card glass-card-hover animate-fade-up rounded-2xl p-5" style={{ animationDelay: '0.6s' }}>
          <h2 className="mb-4 font-display font-semibold text-white">Recent Invoices</h2>
          <div className="space-y-2.5">
            {recentInvoices.map((inv) => (
              <div key={inv.id} className="panel-row flex items-center justify-between px-3 py-2.5">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-amber-400/25 to-orange-400/15 text-xs font-bold text-amber-200">
                    $
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-100">{inv.patient.name}</p>
                    <p className="text-xs text-slate-400">{inv.items}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-display text-sm font-bold text-white">${inv.amount.toFixed(2)}</p>
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
