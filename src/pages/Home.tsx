import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <div style={{ padding: '2rem' }}>
      <h1>欢迎来到主页</h1>
      <Link to="/author/profile">我的资料页面</Link>
    </div>
  )
}
