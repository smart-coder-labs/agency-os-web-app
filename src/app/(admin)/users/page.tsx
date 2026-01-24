import { prisma } from '@/lib/db'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { Button } from '@/components/ui/Button'
import { UsersTable } from '@/components/users/UsersTable'
import { UserPlus } from 'lucide-react'

export default async function UsersPage() {
  const users = await prisma.users.findMany({ 
    orderBy: { created_at: 'desc' } 
  })

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <SectionHeader 
        title="Users" 
        description="Manage team members and access permissions."
        actions={
          <Button leftIcon={<UserPlus className="w-4 h-4" />}>
            Invite User
          </Button>
        }
      />
      
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
         <UsersTable data={users as any[]} />
      </div>
    </div>
  )
}
