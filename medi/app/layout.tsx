import '../styles/globals.css'

export const metadata = {
  title: 'MediCore',
  description: 'MediCore — Hospital Management Platform',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <main className="min-h-screen bg-gray-50 text-gray-900">
          <div className="container mx-auto p-6">{children}</div>
        </main>
      </body>
    </html>
  )
}
