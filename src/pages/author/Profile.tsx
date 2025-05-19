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

  if (loading) return <p>加载中...</p>
  if (error) return <p style={{ color: 'red' }}>加载失败：{error}</p>

  return (
    <div style={{ padding: '2rem' }}>
      <h1>个人资料</h1>
      <p><strong>昵称：</strong> {data?.nickname}</p>
      <p><strong>简介：</strong> {data?.summary}</p>
    </div>
  )
}
