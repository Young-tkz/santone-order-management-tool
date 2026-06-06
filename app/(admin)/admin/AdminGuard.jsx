'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export default function AdminGuard({ children }) {
    const router = useRouter()
    const [checking, setChecking] = useState(true)

    useEffect(() => {
        async function verify() {
            const { data } = await supabase.auth.getSession()
            const session = data?.session

            if (!session) {
                router.replace('/admin/login')
            } else {
                setChecking(false)
            }
        }

        verify()
    }, [router])

    if (checking) {
        return (
            <div className="min-h-screen flex items-center justify-center text-slate-600">
                Checking authentication…
            </div>
        )
    }

    return children
}
