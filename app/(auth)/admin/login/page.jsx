// app/(auth)/admin/login/page.jsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'   // ✅ USING YOUR FILE

export default function AdminAuthPage() {
    const router = useRouter()

    const [mode, setMode] = useState('signin')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState(null)
    const [error, setError] = useState(null)

    async function handleSubmit(e) {
        e.preventDefault()
        setError(null)
        setMessage(null)
        setLoading(true)

        try {
            if (mode === 'signin') {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                })
                if (error) throw error

                router.push('/admin/dashboard')
            } else {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                })
                if (error) throw error

                setMessage('Signup successful. Redirecting...')
                setTimeout(() => router.push('/admin/dashboard'), 700)
            }
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-8">
            <div className="w-full max-w-md bg-white rounded-2xl p-8 shadow-lg">

                {/* Logo */}
                <div className="flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full bg-emerald-700 flex items-center justify-center text-white font-bold text-lg">
                        SE
                    </div>
                    <h1 className="mt-4 text-2xl font-extrabold text-slate-900">Santone Enterprises</h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Admin Dashboard {mode === 'signin' ? 'Login' : 'Sign Up'}
                    </p>
                </div>

                {/* Tabs */}
                <div className="mt-6 flex justify-center gap-3">
                    <button
                        onClick={() => { setMode('signin'); setMessage(null); setError(null) }}
                        className={`px-4 py-2 rounded-lg border ${
                            mode === 'signin'
                                ? 'bg-emerald-700 text-white border-emerald-700'
                                : 'bg-transparent text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                    >
                        Sign In
                    </button>
                    <button
                        onClick={() => { setMode('signup'); setMessage(null); setError(null) }}
                        className={`px-4 py-2 rounded-lg border ${
                            mode === 'signup'
                                ? 'bg-emerald-700 text-white border-emerald-700'
                                : 'bg-transparent text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                    >
                        Sign Up
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="mt-6 space-y-4 text-slate-800">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Email address</label>
                        <input
                            type="email"
                            required
                            placeholder="admin@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-200 outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                        <input
                            type="password"
                            required
                            placeholder="Enter your password"
                            minLength={6}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-200 outline-none"
                        />
                    </div>

                    {error && (
                        <div className="p-3 rounded-lg bg-red-50 text-red-800 text-sm">
                            {error}
                        </div>
                    )}

                    {message && (
                        <div className="p-3 rounded-lg bg-emerald-50 text-emerald-800 text-sm">
                            {message}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full px-4 py-3 rounded-lg bg-emerald-700 text-white font-semibold hover:bg-emerald-600 disabled:opacity-70"
                    >
                        {loading ? 'Please wait...' : (mode === 'signin' ? 'Login' : 'Create account')}
                    </button>
                </form>

                {/* Switch mode */}
                <div className="mt-4 text-center text-sm text-slate-600">
                    {mode === 'signin' ? (
                        <span>
              Do not have an account?{' '}
                            <button
                                onClick={() => { setMode('signup'); setMessage(null); setError(null) }}
                                className="text-emerald-700 underline font-medium"
                            >
                Sign up
              </button>
            </span>
                    ) : (
                        <span>
              Already have an account?{' '}
                            <button
                                onClick={() => { setMode('signin'); setMessage(null); setError(null) }}
                                className="text-emerald-700 underline font-medium"
                            >
                Sign in
              </button>
            </span>
                    )}
                </div>

                {/* Support */}
                <div className="mt-4 text-center text-sm text-slate-400">
                    Support: <span className="text-slate-700 font-medium">+265 997 047 607</span>
                </div>
            </div>
        </div>
    )
}
