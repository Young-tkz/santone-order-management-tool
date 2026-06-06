'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'

export default function OrdersTable({ initialOrders = [] }) {
    const [search, setSearch] = useState('')
    const [status, setStatus] = useState('all') // all / pending / ordered / shipped / delivered / quoted

    // derived filtered list (client-side)
    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase()
        return initialOrders.filter((o) => {
            if (status !== 'all' && (o.status ?? '').toLowerCase() !== status) return false
            if (!q) return true

            // search by order_code or customer_name
            const code = (o.order_code ?? '').toLowerCase()
            const name = (o.customer_name ?? '').toLowerCase()
            return code.includes(q) || name.includes(q)
        })
    }, [initialOrders, search, status])

    return (
        <div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                    <input
                        type="search"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by order ID or customer name..."
                        className="border rounded px-3 py-2 w-[280px]"
                    />

                    <select
                        className="border rounded px-3 py-2"
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                    >
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="ordered">Ordered</option>
                        <option value="quoted">Quoted</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                    </select>
                </div>

                <div>
                    <span className="text-sm text-slate-600">
                        Showing <strong>{filtered.length}</strong> of {initialOrders.length}
                    </span>
                </div>
            </div>

            <div className="bg-white rounded shadow overflow-x-auto">
                <table className="min-w-full divide-y">
                    <thead className="bg-slate-50">
                    <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium">Order ID</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Customer</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Phone</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Price</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Date</th>
                        <th className="px-4 py-3 text-right text-sm font-medium">Action</th>
                    </tr>
                    </thead>

                    <tbody className="divide-y">
                    {filtered.map((o) => (
                        <tr key={o.id ?? (o.order_code ?? Math.random())}>
                            <td className="px-4 py-4 text-sm">
                                {o.order_code ?? (o.id ? o.id.slice(0, 8) : '—')}
                            </td>
                            <td className="px-4 py-4 text-sm">{o.customer_name ?? '-'}</td>
                            <td className="px-4 py-4 text-sm">{o.customer_phone ?? '-'}</td>
                            <td className="px-4 py-4 text-sm">
                                {/* show MWK total if present, otherwise item_price + delivery */}
                                {typeof o.total_mwk === 'number'
                                    ? `MWK ${o.total_mwk.toLocaleString()}`
                                    : (o.item_price != null ? `$${o.item_price}` : '-')}
                            </td>
                            <td className="px-4 py-4 text-sm">
                                    <span
                                        className={
                                            'inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ' +
                                            (o.status === 'delivered'
                                                ? 'bg-emerald-100 text-emerald-800'
                                                : o.status === 'shipped'
                                                    ? 'bg-sky-100 text-sky-800'
                                                    : o.status === 'pending'
                                                        ? 'bg-amber-100 text-amber-800'
                                                        : 'bg-slate-100 text-slate-800')
                                        }
                                    >
                                        {o.status ?? 'pending'}
                                    </span>
                            </td>
                            <td className="px-4 py-4 text-sm">
                                {o.created_at ? new Date(o.created_at).toLocaleDateString() : '-'}
                            </td>
                            <td className="px-4 py-4 text-right">
                                {o.id ? (
                                    <Link
                                        href={`/admin/orders/${o.id}`}
                                        className="text-sm px-3 py-1 border rounded hover:bg-slate-50"
                                    >
                                        View
                                    </Link>
                                ) : (
                                    <button disabled className="text-sm px-3 py-1 border rounded opacity-50">
                                        View
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}

                    {filtered.length === 0 && (
                        <tr>
                            <td colSpan={7} className="px-4 py-6 text-center text-sm text-slate-500">
                                No orders found.
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
