import './globals.css'
import type { Metadata } from 'next'
import Sidebar from '@/components/layout/Sidebar'

export const metadata: Metadata = {
  title: 'Agency OS Admin',
  description: 'Admin panel for Agency OS',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full">
        <div className="h-full w-full grid grid-cols-1 md:grid-cols-[240px_1fr]">
          <Sidebar />
          <div className="min-h-0 flex flex-col">
            <header className="bg-white border-b border-[var(--color-border)]">
              <div className="px-4 py-3">
                <div className="text-sm text-gray-500">Admin</div>
              </div>
            </header>
            <main className="flex-1 overflow-auto p-4">{children}</main>
          </div>
        </div>
      </body>
    </html>
  )
}
