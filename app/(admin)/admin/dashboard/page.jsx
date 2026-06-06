// app/(admin)/admin/dashboard/page.jsx
import { format } from 'date-fns'
import { supabase } from '@/lib/supabaseClient' // you said this exists

function StatCard({ title, value, hint }) {
    return (
        <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-sm text-slate-500">{title}</div>
            <div className="mt-2 text-2xl font-bold">{value}</div>
            {hint && <div className="mt-1 text-xs text-slate-400">{hint}</div>}
        </div>
    )
}

function RecentRow({ order }) {
    return (
        <div className="flex items-center justify-between py-3 border-b last:border-b-0">
            <div className="text-sm">
                <div className="font-medium">{order.order_code || order.id.slice(0,8)}</div>
                <div className="text-xs text-slate-500">{order.customer_name}</div>
            </div>

            <div className="text-sm text-right">
                <div className="text-sm font-medium">MWK {Number(order.total_mwk).toLocaleString()}</div>
                <div className="text-xs text-slate-400">{format(new Date(order.created_at), 'yyyy-MM-dd')}</div>
            </div>

            <div className="ml-6">
        <span className={`px-3 py-1 rounded-full text-xs ${statusBadgeClass(order.status)}`}>
          {order.status}
        </span>
            </div>
        </div>
    )
}

function statusBadgeClass(status) {
    switch ((status || '').toLowerCase()) {
        case 'pending': return 'bg-amber-100 text-amber-700'
        case 'ordered': return 'bg-yellow-100 text-yellow-800'
        case 'shipped': return 'bg-sky-100 text-sky-700'
        case 'delivered': return 'bg-emerald-100 text-emerald-700'
        case 'quoted': return 'bg-indigo-100 text-indigo-700'
        default: return 'bg-slate-100 text-slate-700'
    }
}

/**
 * Server component
 */
export default async function DashboardPage() {
    // 1) total count
    // 2) counts by status (single queries)
    // 3) this week's count
    // 4) latest 5 orders
    // We'll run queries in parallel for speed.
    const now = new Date()
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()

    // run multiple queries in parallel
    const [
        totalRes,
        pendingRes,
        orderedRes,
        shippedRes,
        deliveredRes,
        quotedRes,
        thisWeekRes,
        recentRes
    ] = await Promise.all([
        supabase.from('orders').select('id', { count: 'exact' }),
        supabase.from('orders').select('id', { count: 'exact' }).eq('status', 'pending'),
        supabase.from('orders').select('id', { count: 'exact' }).eq('status', 'ordered'),
        supabase.from('orders').select('id', { count: 'exact' }).eq('status', 'shipped'),
        supabase.from('orders').select('id', { count: 'exact' }).eq('status', 'delivered'),
        supabase.from('orders').select('id', { count: 'exact' }).eq('status', 'quoted'),
        supabase.from('orders').select('id', { count: 'exact' }).gte('created_at', weekAgo),
        supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(5)
    ])

    // pick counts (supabase returns .count)
    const total = totalRes?.count ?? 0
    const pending = pendingRes?.count ?? 0
    const ordered = orderedRes?.count ?? 0
    const shipped = shippedRes?.count ?? 0
    const delivered = deliveredRes?.count ?? 0
    const quoted = quotedRes?.count ?? 0
    const thisWeek = thisWeekRes?.count ?? 0
    const recent = recentRes?.data ?? []

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold">Dashboard</h1>
                <p className="text-slate-500 mt-1">Placeholder dashboard — stats and charts will go here.</p>
            </div>

            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                <StatCard title="Total Orders" value={total} hint="+X% from last month" />
                <StatCard title="Pending" value={pending} />
                <StatCard title="Shipped" value={shipped} />
                <StatCard title="Delivered" value={delivered} />
            </div>

            <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <h2 className="text-lg font-semibold mb-4">This Week</h2>
                    <div className="text-2xl font-bold">{thisWeek}</div>
                    <div className="mt-2 text-sm text-slate-500">Orders in the last 7 days</div>

                    <div className="mt-6 border-t pt-4">
                        <h3 className="text-sm font-medium mb-2">Counts by status</h3>
                        <ul className="text-sm space-y-1 text-slate-600">
                            <li>Pending: {pending}</li>
                            <li>Ordered: {ordered}</li>
                            <li>Quoted: {quoted}</li>
                            <li>Shipped: {shipped}</li>
                            <li>Delivered: {delivered}</li>
                        </ul>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6">
                    <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
                    {recent.length === 0 ? (
                        <div className="text-sm text-slate-500">No recent orders.</div>
                    ) : (
                        <div>
                            {recent.map((o) => (
                                <RecentRow key={o.id} order={o} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
