import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Profile from './pages/author/Profile'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/author/profile" element={<Profile />} />
    </Routes>
  )
}
