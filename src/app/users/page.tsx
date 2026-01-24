import Link from 'next/link'
import { prisma } from '@/lib/db'

export default async function UsersPage() {
  const users = await prisma.users.findMany({ orderBy: { created_at: 'desc' } }) as any
  return (
    <main style={{ padding: 24 }}>
      <h1>Users</h1>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th align="left">Email</th>
            <th align="left">Name</th>
            <th>Created</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u:any) => (
            <tr key={u.id}>
              <td>{u.email}</td>
              <td>{u.full_name}</td>
              <td>{new Date(u.created_at).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  )
}
