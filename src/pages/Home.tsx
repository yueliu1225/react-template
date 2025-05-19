import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <div style={{ padding: '2rem' }}>
      <h1>Welcome</h1>
      <Link to="/author/profile">My profile</Link>
    </div>
  )
}
