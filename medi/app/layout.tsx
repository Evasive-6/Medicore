import '../styles/globals.css'
import Providers from './providers'

export const metadata = {
  title: 'MediCore',
  description: 'MediCore — Hospital Management Platform',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <div className="fut-bg min-h-screen">
            <div className="grid-overlay pointer-events-none fixed inset-0 z-0" aria-hidden />
            <div className="orb orb-a animate-float-slow" aria-hidden />
            <div className="orb orb-b animate-float" aria-hidden />
            <div className="orb orb-c animate-float" style={{ animationDelay: '2s' }} aria-hidden />
            <div className="relative z-10">{children}</div>
          </div>
        </Providers>
      </body>
    </html>
  )
}
