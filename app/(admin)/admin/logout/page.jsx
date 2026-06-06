'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient' // adjust path if needed

export default function LogoutPage() {
    const router = useRouter()

    useEffect(() => {
        let mounted = true
        async function run() {
            try {
                await supabase.auth.signOut()
            } catch (err) {
                // ignore
            } finally {
                if (mounted) router.replace('/admin/login')
            }
        }
        run()
        return () => { mounted = false }
    }, [router])

    return (
        <div style={{ padding: 40, textAlign: 'center' }}>
            <p>Signing out…</p>
        </div>
    )
}
