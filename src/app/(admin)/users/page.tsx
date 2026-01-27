import { getUsers } from '@/lib/dal/users.dal'
import { SectionHeader } from '@/shared/components/ui/SectionHeader'
import { Button } from '@/shared/components/ui/Button'
import { UsersTable } from './_components/UsersTable'
import { UserPlus } from 'lucide-react'

export default async function UsersPage() {
  const users = await getUsers()

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
