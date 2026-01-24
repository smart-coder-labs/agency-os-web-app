import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Agency OS Admin',
  description: 'Admin panel for Agency OS',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
            <a href="/" className="font-semibold">Agency OS Admin</a>
            <nav className="flex gap-4 text-sm">
              <a href="/dashboard">Dashboard</a>
              <a href="/projects">Projects</a>
              <a href="/tasks">Tasks</a>
              <a href="/user-stories">Stories</a>
              <a href="/users">Users</a>
            </nav>
          </div>
        </header>
        <main className="px-4 py-6">{children}</main>
      </body>
    </html>
  )
}
