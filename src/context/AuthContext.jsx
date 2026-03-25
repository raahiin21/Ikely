import { createContext, useContext, useState } from 'react'
import {
    getUsers, saveUsers,
    getSession, saveSession, clearSession,
    getUserById
} from '../utils/storage'

const AuthContext = createContext(null)

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2)
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(() => getSession())

    function signup({ name, email, password }) {
        const users = getUsers()
        if (users.find(u => u.email === email)) {
            return { error: 'An account with this email already exists.' }
        }
        const newUser = { id: generateId(), name, email, password }
        saveUsers([...users, newUser])
        saveSession(newUser)
        setCurrentUser(newUser)
        return { success: true }
    }

    function login({ email, password }) {
        const users = getUsers()
        const user = users.find(u => u.email === email && u.password === password)
        if (!user) return { error: 'Invalid email or password.' }
        saveSession(user)
        setCurrentUser(user)
        return { success: true }
    }

    function logout() {
        clearSession()
        setCurrentUser(null)
    }

    function refreshUser() {
        const updated = getUserById(currentUser?.id)
        if (updated) {
            saveSession(updated)
            setCurrentUser(updated)
        }
    }

    return (
        <AuthContext.Provider value={{ currentUser, signup, login, logout, refreshUser }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    return useContext(AuthContext)
}