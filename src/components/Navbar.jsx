import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Navbar.css'

export default function Navbar() {
    const { currentUser, logout } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()
    const [menuOpen, setMenuOpen] = useState(false)

    function handleLogout() {
        logout()
        navigate('/login')
        setMenuOpen(false)
    }

    const isHome = location.pathname === '/'

    return (
        <header className="navbar-wrap">
            <nav className="navbar">
                <div className="navbar-inner">
                    <Link to="/" className="navbar-brand">
                        <span className="brand-icon">✦</span>
                        Substack Lite
                    </Link>

                    <div className="navbar-actions">
                        {currentUser ? (
                            <>
                                <Link to="/write" className="btn btn-accent btn-sm">
                                    + Write
                                </Link>
                                <div className="nav-user-menu">
                                    <button
                                        className="nav-avatar"
                                        onClick={() => setMenuOpen(o => !o)}
                                        aria-label="User menu"
                                    >
                                        {currentUser.name.charAt(0).toUpperCase()}
                                    </button>
                                    {menuOpen && (
                                        <div className="nav-dropdown">
                                            <div className="nav-dropdown-header">
                                                <strong>{currentUser.name}</strong>
                                                <span>{currentUser.email}</span>
                                            </div>
                                            <Link
                                                to={`/profile/${currentUser.id}`}
                                                className="nav-dropdown-item"
                                                onClick={() => setMenuOpen(false)}
                                            >
                                                Your profile
                                            </Link>
                                            <Link
                                                to="/write"
                                                className="nav-dropdown-item"
                                                onClick={() => setMenuOpen(false)}
                                            >
                                                New post
                                            </Link>
                                            <hr className="nav-dropdown-divider" />
                                            <button className="nav-dropdown-item danger" onClick={handleLogout}>
                                                Sign out
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="btn btn-ghost btn-sm">Sign in</Link>
                                <Link to="/signup" className="btn btn-accent btn-sm">Get started</Link>
                            </>
                        )}
                    </div>
                </div>
            </nav>
        </header>
    )
}