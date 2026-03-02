'use client'
import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    const fetchMe = useCallback(async () => {
        try {
            const res = await fetch('/api/auth/me', { credentials: 'include' })
            if (res.ok) {
                const data = await res.json()
                setUser(data.user)
            } else {
                setUser(null)
            }
        } catch {
            setUser(null)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => { fetchMe() }, [fetchMe])

    const login = async (campusId, password) => {
        const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ campusId, password }),
            credentials: 'include',
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Login failed')
        setUser(data.user)
        return data.user
    }

    const logout = async () => {
        await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
        setUser(null)
        router.push('/login')
    }

    const isAdmin = user?.role === 'admin'
    const restrictionLevel = user?.restrictionLevel || 'NONE'
    const isRestricted = user?.status === 'restricted' || user?.status === 'limited'
    const isLimited = restrictionLevel === 'LIMITED'
    const isFull = restrictionLevel === 'FULL'
    const canAct = !isRestricted // Can post/claim/edit

    return (
        <AuthContext.Provider value={{
            user, loading, login, logout, fetchMe,
            isAdmin, isRestricted, isLimited, isFull, canAct,
            restrictionLevel,
            restrictionReason: user?.restrictionReason || '',
        }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
    return ctx
}
