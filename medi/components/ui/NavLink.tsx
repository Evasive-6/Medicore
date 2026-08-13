'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function NavLink({
  href,
  label,
  icon,
}: {
  href: string
  label: string
  icon: React.ReactNode
}) {
  const pathname = usePathname()
  const active = pathname === href || pathname.startsWith(href + '/')

  return (
    <Link
      href={href}
      className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
        active
          ? 'bg-teal-600 text-white'
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
      }`}
    >
      <span className="text-base">{icon}</span>
      {label}
    </Link>
  )
}
