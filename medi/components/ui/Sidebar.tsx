'use client'

import { signOut, useSession } from 'next-auth/react'
import Link from 'next/link'
import NavLink from './NavLink'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/patients', label: 'Patients', icon: '👥' },
  { href: '/doctors', label: 'Doctors', icon: '🩺' },
  { href: '/appointments', label: 'Appointments', icon: '📅' },
  { href: '/prescriptions', label: 'Prescriptions', icon: '📝' },
  { href: '/pharmacy', label: 'Pharmacy', icon: '💊' },
  { href: '/laboratory', label: 'Laboratory', icon: '🧪' },
  { href: '/billing', label: 'Billing', icon: '💳' },
]

export default function Sidebar() {
  const { data: session } = useSession()

  return (
    <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 flex-col border-r border-teal-400/10 bg-[#050a14]/85 backdrop-blur-xl md:flex">
      <Link href="/dashboard" className="flex items-center gap-3 border-b border-white/5 px-5 py-4">
        <div className="animate-gradient flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-400 to-cyan-500 font-display text-lg font-bold text-[#03131a] shadow-[0_0_24px_rgba(45,212,191,0.4)]">
          +
        </div>
        <div>
          <p className="font-display text-sm font-bold text-white">MediCore</p>
          <p className="text-[0.68rem] tracking-wide text-slate-400">HOSPITAL · NEXUS</p>
        </div>
      </Link>

      <div className="px-5 pb-1 pt-4 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-slate-500">
        Modules
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
        {navItems.map((item) => (
          <NavLink key={item.href} href={item.href} label={item.label} icon={item.icon} />
        ))}
      </nav>

      <div className="border-t border-white/5 p-3">
        <div className="mb-3 flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.04] px-3 py-2">
          <div className="relative">
            <div className="animate-gradient flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 text-xs font-bold text-[#03131a]">
              {(session?.user?.name || 'U').charAt(0).toUpperCase()}
            </div>
            <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)]" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-slate-100">{session?.user?.name}</p>
            <p className="truncate text-[0.68rem] uppercase tracking-wider text-teal-300/70">{session?.user?.role ?? 'STAFF'}</p>
          </div>
        </div>
        <button onClick={() => signOut({ callbackUrl: '/login' })} className="btn-ghost w-full">
          Exit system
        </button>
      </div>
    </aside>
  )
}
