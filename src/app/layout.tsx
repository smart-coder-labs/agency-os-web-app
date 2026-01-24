import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Agency OS Admin',
  description: 'Admin panel for Agency OS',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
