import Link from 'next/link'
import { prisma } from '@/lib/db'

export default async function UsersPage() {
  const users = await prisma.users.findMany({ orderBy: { created_at: 'desc' } }) as any
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Users</h1>
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="text-left px-4 py-2">Email</th>
              <th className="text-left px-4 py-2">Name</th>
              <th className="px-4 py-2">Created</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u:any) => (
              <tr key={u.id} className="border-t">
                <td className="px-4 py-2">{u.email}</td>
                <td className="px-4 py-2">{u.full_name}</td>
                <td className="px-4 py-2 text-center">{new Date(u.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
