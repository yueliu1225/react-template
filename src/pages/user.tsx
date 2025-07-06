// src/pages/users.tsx
import { useGetAllQuery } from '@/services/mo_userApi'
import type { MoUser } from '@/types/mo_user'

export default function UsersPage() {
  const { data: users = [], isLoading, error } = useGetAllQuery()

  if (isLoading) return <p>Loading users...</p>
  if (error) return <p>Error loading users</p>

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">User List</h1>
      <table className="table-auto border w-full text-sm">
        <thead>
          <tr className="bg-gray-100">
            {Object.keys(users[0] || {}).map((key) => (
              <th key={key} className="border px-2 py-1 text-left">{key}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {users.map((user: MoUser) => (
            <tr key={user.id}>
              {Object.entries(user).map(([key, value]) => (
                <td key={key} className="border px-2 py-1">
                  {typeof value === 'string' && value.length > 100
                    ? value.slice(0, 100) + '...'
                    : String(value)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
