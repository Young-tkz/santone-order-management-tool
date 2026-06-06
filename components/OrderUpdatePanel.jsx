// components/OrderUpdatePanel.jsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function OrderUpdatePanel({ order }) {
    const router = useRouter()
    const [status, setStatus] = useState(order.status || 'pending')
    const [adminNotes, setAdminNotes] = useState(order.admin_notes || '')
    const [loading, setLoading] = useState(false)

    async function save() {
        setLoading(true)
        try {
            const res = await fetch('/api/admin/orders/update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: order.id, status, admin_notes: adminNotes })
            })
            const json = await res.json()
            if (res.ok && json.ok) {
                alert('Order updated.')
                router.refresh() // re-fetch server components / order details
            } else {
                console.error('Order update failed', json)
                alert('Failed to update order. Check console.')
            }
        } catch (err) {
            console.error(err)
            alert('Request failed. Check console.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="bg-white p-6 rounded shadow">
            <h3 className="text-lg font-semibold mb-4">Update Status</h3>

            <div className="mb-4">
                <label className="block text-sm text-slate-700 mb-2">Order Status</label>
                <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full border rounded px-3 py-2"
                >
                    <option value="pending">Pending</option>
                    <option value="quoted">Quoted</option>
                    <option value="ordered">Ordered</option>
                    <option value="shipped">Shipped</option>
                    <option value="arriving">Arriving</option>
                    <option value="delivered">Delivered</option>
                </select>
            </div>

            <div className="mb-4">
                <label className="block text-sm text-slate-700 mb-2">Admin Notes</label>
                <textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    className="w-full border rounded px-3 py-2 h-28"
                />
            </div>

            <button
                onClick={save}
                disabled={loading}
                className="bg-green-700 text-white px-4 py-2 rounded hover:bg-green-800 disabled:opacity-60"
            >
                {loading ? 'Saving…' : 'Save Changes'}
            </button>
        </div>
    )
}
