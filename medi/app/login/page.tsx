'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'

function ECGIcon() {
  return (
    <svg viewBox="0 0 240 60" className="ecg-glow h-10 w-40" aria-hidden>
      <polyline
        className="ecg-line"
        points="0,30 30,30 38,30 42,18 48,46 54,30 60,30 90,30 98,30 102,12 108,42 114,30 120,30 150,30 158,30 162,20 168,44 174,30 180,30 210,30 214,30 218,24 222,36 226,30 240,30"
      />
    </svg>
  )
}

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await signIn('credentials', { email, password, redirect: false })

    if (res?.error) {
      setError('Invalid email or password.')
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4">
      <span className="pointer-events-none absolute left-[12%] top-[18%] animate-float text-2xl text-teal-400/20">+</span>
      <span className="pointer-events-none absolute right-[15%] top-[24%] animate-float-slow text-xl text-cyan-400/20">✚</span>
      <span className="pointer-events-none absolute bottom-[20%] left-[20%] animate-float-slow text-xl text-violet-400/20" style={{ animationDelay: '1.5s' }}>＋</span>
      <span className="pointer-events-none absolute bottom-[28%] right-[18%] animate-float text-lg text-teal-400/20" style={{ animationDelay: '3s' }}>✚</span>

      <div className="w-full max-w-md animate-scale-in">
        <div className="relative overflow-hidden rounded-3xl border border-teal-400/20 bg-white/[0.04] p-8 shadow-[0_20px_70px_rgba(0,0,0,0.55)] backdrop-blur-xl">
          <div className="scanline" aria-hidden />
          <div className="pointer-events-none absolute -right-20 -top-20 h-52 w-52 rounded-full bg-teal-400/10 blur-3xl" aria-hidden />
          <div className="pointer-events-none absolute -bottom-20 -left-20 h-52 w-52 rounded-full bg-cyan-400/10 blur-3xl" aria-hidden />

          <div className="mb-8 text-center">
            <div className="relative mx-auto mb-4 flex h-16 w-16 items-center justify-center">
              <span className="pulse-ring" aria-hidden />
              <div className="animate-gradient flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-400 to-cyan-500 font-display text-2xl font-bold text-[#03131a] shadow-[0_0_30px_rgba(45,212,191,0.5)]">
                +
              </div>
            </div>
            <h1 className="font-display text-3xl font-bold tracking-tight">
              <span className="text-gradient">MediCore</span>
            </h1>
            <p className="mt-2 text-sm text-slate-400">Futuristic hospital command center</p>
            <div className="mt-4 flex justify-center">
              <ECGIcon />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="animate-fade-up">
              <label htmlFor="email" className="input-label">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@medicore.dev"
                className="input"
              />
            </div>
            <div className="animate-fade-up delay-100">
              <label htmlFor="password" className="input-label">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input"
              />
            </div>

            {error && (
              <div className="animate-fade-in rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full animate-fade-up delay-200 py-2.5">
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#03131a]/40 border-t-[#03131a]" />
                  Initializing…
                </span>
              ) : (
                'Access Command Center'
              )}
            </button>
          </form>

          <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-xs text-slate-400">
            <p className="mb-2 font-semibold text-slate-300">Demo access</p>
            <div className="flex justify-between">
              <span>Admin</span>
              <span className="font-mono text-teal-300/80">admin@medicore.dev · admin123</span>
            </div>
            <div className="mt-1 flex justify-between">
              <span>Doctor</span>
              <span className="font-mono text-teal-300/80">sarah@medicore.dev · admin123</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
