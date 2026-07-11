import Sidebar from './_components/layout/Sidebar'
import AdminHeader from './_components/layout/AdminHeader'
import { ScrollArea } from '@/shared/components/ui/ScrollArea'
import { Toaster } from 'sonner'

export const dynamic = 'force-dynamic'

export default function AdminLayout({ children, modal }: { children: React.ReactNode, modal: React.ReactNode }) {
  return (
    <div className="h-full w-full grid grid-cols-1 md:grid-cols-[260px_1fr]" style={{ background: '#070B13' }}>
      <Sidebar />
      <div className="min-h-0 flex flex-col" style={{ background: '#070B13' }}>
        <AdminHeader />
        <ScrollArea className="flex-1">
          <main className="p-6 md:p-8 max-w-7xl mx-auto w-full" style={{ background: '#070B13' }}>
            {children}
            {modal}
          </main>
        </ScrollArea>
      </div>
      <Toaster position="bottom-right" />
    </div>
  )
}
