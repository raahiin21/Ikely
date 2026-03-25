import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Navbar.css'

export default function Navbar() {
    const { currentUser, logout } = useAuth()
    const navigate = useNavigate()

    function handleLogout() {
        logout()
        navigate('/login')
    }

    return (
        <nav className="navbar">
            <div className="navbar-inner">
                <Link to="/" className="navbar-brand">Ikely</Link>
                <div className="navbar-actions">
                    {currentUser ? (
                        <>
                            <Link to="/write" className="nav-btn nav-btn-ghost">Write</Link>
                            <Link to={`/profile/${currentUser.id}`} className="nav-avatar">
                                {currentUser.name.charAt(0).toUpperCase()}
                            </Link>
                            <button onClick={handleLogout} className="nav-btn nav-btn-ghost">Sign out</button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="nav-btn nav-btn-ghost">Sign in</Link>
                            <Link to="/signup" className="nav-btn nav-btn-primary">Get started</Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    )
}