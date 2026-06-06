// app/(admin)/admin/orders/page.jsx
import OrdersTable from '@/components/OrdersTable'
import { supabase } from '@/lib/supabaseClient'

export default async function OrdersPage() {
    // fetch all orders (most recent first)
    const { data: orders, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Supabase error fetching orders', error)
    }

    // pass to client component as initial data
    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Orders</h1>
            <OrdersTable initialOrders={orders ?? []} />
        </div>
    )
}
