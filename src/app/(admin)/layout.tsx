import Sidebar from './_components/layout/Sidebar'
import AdminHeader from './_components/layout/AdminHeader'
import { ScrollArea } from '@/shared/components/ui/ScrollArea'

export const dynamic = 'force-dynamic'

export default function AdminLayout({ children, modal }: { children: React.ReactNode, modal: React.ReactNode }) {
  return (
    <div className="h-full w-full grid grid-cols-1 md:grid-cols-[260px_1fr] bg-[#F5F5F7]">
      <Sidebar />
      <div className="min-h-0 flex flex-col">
        <AdminHeader />
        <ScrollArea className="flex-1">
          <main className="p-6 md:p-8 max-w-7xl mx-auto w-full">
            {children}
            {modal}
          </main>
        </ScrollArea>
      </div>
    </div>
  )
}
