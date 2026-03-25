import { useState } from 'react'
import {
    getUsers, saveUsers,
    getSession, saveSession, clearSession,
    getUserById
} from '../utils/storage'

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2)
}

export function useAuth() {
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

    return { currentUser, signup, login, logout, refreshUser }
}