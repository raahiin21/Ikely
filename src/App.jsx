import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Home from './pages/Home'
import Write from './pages/Write'
import PostDetail from './pages/PostDetail'
import Profile from './pages/Profile'

// Placeholder pages (fill in later phases)
function PlaceholderPage({ name }) {
  return <div style={{ padding: '40px', textAlign: 'center', fontSize: '1.2rem' }}>{name} — coming in next phase</div>
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/write" element={<Write />} />
        <Route path="/post/:id" element={<PostDetail />} />
        <Route path="/profile/:id" element={<Profile />} />
      </Routes>
    </BrowserRouter>
  )
}