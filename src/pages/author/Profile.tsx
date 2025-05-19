// src/pages/author/Profile.tsx
import { useEffect, useState } from 'react'

export default function Profile() {
  const [data, setData] = useState<{ nickname: string; summary: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/profile')
      .then((res) => {
        if (!res.ok) throw new Error('Network error')
        return res.json()
      })
      .then((json) => setData(json))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p>Loading...</p>
  if (error) return <p style={{ color: 'red' }}>Loading fails：{error}</p>

  return (
    <div style={{ padding: '2rem' }}>
      <h1>My Profile</h1>
      <p><strong>Nickname:</strong> {data?.nickname}</p>
      <p><strong>Summary:</strong> {data?.summary}</p>
    </div>
  )
}
