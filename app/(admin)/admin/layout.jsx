// app/(admin)/admin/layout.jsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import AdminGuard from './AdminGuard' // <-- guard kept next to layout

export default function AdminLayout({ children }) {
    const pathname = usePathname()

    const linkClass = (path) =>
        `flex items-center gap-3 px-4 py-3 rounded-lg font-medium
     ${pathname === path ? 'bg-green-700 text-white' : 'text-white/80 hover:text-white'}`

    return (
        <div className="flex min-h-screen bg-gray-100 text-slate-800">
            <aside className="w-64 bg-green-600 text-white p-6 flex flex-col justify-between">

                <div>
                    <h2 className="text-2xl font-bold mb-8">Santone<br/>Enterprises</h2>

                    <nav className="space-y-2">
                        <Link href="/admin/dashboard" className={linkClass('/admin/dashboard')}>
                            <span>📊</span> Dashboard
                        </Link>

                        <Link href="/admin/orders" className={linkClass('/admin/orders')}>
                            <span>📦</span> Orders
                        </Link>

                        <Link href="/admin/settings" className={linkClass('/admin/settings')}>
                            <span>⚙️</span> Settings
                        </Link>
                    </nav>
                </div>

                <div>
                    <Link href="/admin/logout" className="flex items-center gap-3 text-white/80 hover:text-white">
                        <span>↩️</span> Logout
                    </Link>
                </div>

            </aside>

            <main className="flex-1 p-8">
                <AdminGuard>
                    {children}
                </AdminGuard>
            </main>
        </div>
    )
}
