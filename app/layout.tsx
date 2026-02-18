import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/next'
import { Navbar } from '@/components/navbar'
import './globals.css'
import { AuthProvider } from '@/hooks/useAuth'

export const metadata: Metadata = {
  title: 'CityReport - Smart City Issue Reporting',
  description: 'Report and track infrastructure issues in your city.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <AuthProvider>
        <Navbar />
        <main className="min-h-screen">
          {children}
        </main>
        <Analytics />
        </AuthProvider>
      </body>
    </html>
  )
}
