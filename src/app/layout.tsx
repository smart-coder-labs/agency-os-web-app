import './globals.css'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Agency OS Admin',
  description: 'Admin panel for Agency OS',
}

import { Toaster } from 'sonner'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full">
        {children}
        <Toaster />
      </body>
    </html>
  )
}
