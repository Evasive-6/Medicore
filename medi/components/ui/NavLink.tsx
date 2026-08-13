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
      className={`group relative flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200 ${
        active
          ? 'bg-gradient-to-r from-teal-400/20 to-cyan-400/10 text-teal-200 shadow-[inset_0_0_0_1px_rgba(45,212,191,0.35)]'
          : 'text-slate-400 hover:bg-white/[0.05] hover:text-slate-100'
      }`}
    >
      {active && (
        <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-gradient-to-b from-teal-300 to-cyan-400 shadow-[0_0_10px_rgba(45,212,191,0.9)]" />
      )}
      <span className={`text-base transition-transform duration-200 group-hover:scale-110 ${active ? 'drop-shadow-[0_0_8px_rgba(45,212,191,0.6)]' : ''}`}>
        {icon}
      </span>
      {label}
    </Link>
  )
}
