// app/order/success/[orderId]/page.jsx
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'

export default async function OrderSuccessPage({ params }) {
    // IMPORTANT: unwrap params (some Next versions pass a Promise)
    const { orderId } = await params

    if (!orderId) {
        return (
            <div className="p-8">
                <h1 className="text-2xl font-bold">Order not found</h1>
                <p className="text-slate-600">Missing order ID.</p>
                <Link href="/order" className="text-green-700 mt-4 inline-block">← Place an order</Link>
            </div>
        )
    }

    // Try to fetch by order_code (adjust if you saved to a different column)
    const { data: order, error } = await supabase
        .from('orders')
        .select('*')
        .eq('order_code', orderId) // <--- use order_code if you saved that as the public ID
        .single()

    if (error || !order) {
        // Log server-side error to terminal if any
        console.error('Error fetching order for success page:', error)
        return (
            <div className="p-8">
                <h1 className="text-2xl font-bold">Order not found</h1>
                <p className="text-slate-600">We could not find an order with that ID.</p>
                <Link href="/order" className="text-green-700 mt-4 inline-block">← Place an order</Link>
            </div>
        )
    }

    // Format helpers (simple)
    const formatMWK = (v) => (v ? `MWK ${Number(v).toLocaleString()}` : '-')
    const formatUSD = (v) => (v ? `$${Number(v).toFixed(2)}` : '-')

    return (
        <div className="p-8 text-slate-800">
            <div className="max-w-3xl mx-auto">
                <h1 className="text-3xl font-bold mb-2">Order Submitted!</h1>
                <p className="text-slate-600 mb-6">Your order has been received. Save your Order ID to track it.</p>

                <div className="bg-white p-6 rounded shadow mb-6">
                    <div className="text-sm text-slate-500 mb-2">Your Order ID</div>
                    <div className="text-lg font-semibold mb-4">{order.order_code}</div>

                    <div className="border-t pt-4">
                        <div className="mb-2">
                            <div className="text-xs text-slate-500">Name</div>
                            <div className="font-semibold">{order.customer_name}</div>
                        </div>

                        <div className="mb-2">
                            <div className="text-xs text-slate-500">Total</div>
                            <div className="text-xl font-bold">{order.total_mwk ? formatMWK(order.total_mwk) : '-'}</div>
                        </div>

                        <div className="mt-4">
                            <Link href={`/track?orderId=${order.order_code}`} className="inline-block bg-green-700 text-white px-4 py-2 rounded">
                                Track My Order
                            </Link>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
