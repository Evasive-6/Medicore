'use client'

import { signOut, useSession } from 'next-auth/react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import NavLink from './NavLink'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/patients', label: 'Patients', icon: '👥' },
  { href: '/doctors', label: 'Doctors', icon: '🩺' },
  { href: '/appointments', label: 'Appointments', icon: '📅' },
  { href: '/pharmacy', label: 'Pharmacy', icon: '💊' },
  { href: '/laboratory', label: 'Laboratory', icon: '🧪' },
  { href: '/billing', label: 'Billing', icon: '💳' },
]

export default function Sidebar() {
  const { data: session } = useSession()
  const router = useRouter()

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-gray-200 bg-white">
      <Link href="/dashboard" className="flex items-center gap-3 border-b border-gray-100 px-5 py-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-600 text-lg font-bold text-white">
          +
        </div>
        <div>
          <p className="text-sm font-bold text-gray-900">MediCore</p>
          <p className="text-xs text-gray-500">Hospital Platform</p>
        </div>
      </Link>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {navItems.map((item) => (
          <NavLink key={item.href} href={item.href} label={item.label} icon={item.icon} />
        ))}
      </nav>

      <div className="border-t border-gray-100 p-3">
        <div className="mb-3 flex items-center gap-3 rounded-lg bg-gray-50 px-3 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-600 text-xs font-bold text-white">
            {(session?.user?.name || 'U').charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-gray-900">{session?.user?.name}</p>
            <p className="truncate text-xs text-gray-500">{session?.user?.role ?? 'STAFF'}</p>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
        >
          Sign out
        </button>
      </div>
    </aside>
  )
}
