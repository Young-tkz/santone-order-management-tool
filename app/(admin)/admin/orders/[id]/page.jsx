import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'
import OrderUpdatePanel from '@/components/OrderUpdatePanel'   // <— added

export default async function OrderDetails({ params }) {
    // unwrap params (Next.js sometimes gives a Promise)
    const { id } = await params

    if (!id) {
        return (
            <div className="p-8">
                <h1 className="text-2xl font-bold">Order not found</h1>
                <p className="text-slate-600">Missing order id.</p>
                <Link href="/admin/orders" className="text-green-700 mt-4 inline-block">
                    ← Back to orders
                </Link>
            </div>
        )
    }

    // fetch order
    const { data: order, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', id)
        .single()

    if (error || !order) {
        console.error('Error fetching order', error)
        return (
            <div className="p-8">
                <h1 className="text-2xl font-bold">Order not found</h1>
                <p className="text-slate-600">We could not find that order.</p>
                <Link href="/admin/orders" className="text-green-700 mt-4 inline-block">
                    ← Back to orders
                </Link>
            </div>
        )
    }

    // helpers
    const formatDate = (d) => {
        try {
            return new Date(d).toLocaleDateString()
        } catch {
            return '-'
        }
    }

    const formatMWK = (v) =>
        typeof v === 'number' ? `MWK ${Number(v).toLocaleString()}` : '-'

    const formatUSD = (v) =>
        typeof v === 'number'
            ? `$${Number(v).toFixed(2)}`
            : '-'

    return (
        <div className="p-8">
            <div className="mb-6">
                <Link href="/admin/orders" className="text-slate-600 hover:underline">
                    ← Back to Orders
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* LEFT SIDE: MAIN ORDER INFO */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-6 rounded shadow">
                        <div className="flex items-start justify-between">
                            <div>
                                <h1 className="text-3xl font-bold mb-1">
                                    {order.order_code ?? `Order ${String(order.id).slice(0, 8)}`}
                                </h1>

                                <div
                                    className={
                                        'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ' +
                                        (order.status === 'delivered'
                                            ? 'bg-emerald-100 text-emerald-800'
                                            : order.status === 'shipped'
                                                ? 'bg-sky-100 text-sky-800'
                                                : order.status === 'pending'
                                                    ? 'bg-amber-100 text-amber-800'
                                                    : 'bg-slate-100 text-slate-800')
                                    }
                                >
                                    {order.status ?? 'pending'}
                                </div>
                            </div>

                            <div className="text-right">
                                <div className="text-sm text-slate-500">Order Date</div>
                                <div className="text-sm">{formatDate(order.created_at)}</div>
                            </div>
                        </div>

                        <hr className="my-5" />

                        {/* CUSTOMER INFO */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                                <div className="text-xs text-slate-500">Customer Name</div>
                                <div className="font-semibold">{order.customer_name}</div>
                            </div>

                            <div>
                                <div className="text-xs text-slate-500">Phone</div>
                                <div className="font-semibold">{order.customer_phone}</div>
                            </div>

                            <div>
                                <div className="text-xs text-slate-500">Email</div>
                                <div className="font-semibold">{order.customer_email}</div>
                            </div>
                        </div>

                        {/* PRODUCT LINK */}
                        {order.product_link && (
                            <>
                                <hr className="my-5" />
                                <div>
                                    <div className="text-xs text-slate-500 mb-2">Product Link</div>
                                    <a
                                        href={order.product_link}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-green-600 hover:underline"
                                    >
                                        {order.product_link}
                                    </a>
                                </div>
                            </>
                        )}

                        <hr className="my-5" />

                        {/* PRICE BREAKDOWN */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div>
                                <div className="text-xs text-slate-500">Item Price</div>
                                <div className="text-lg font-semibold">
                                    {formatUSD(Number(order.item_price || 0))}
                                </div>
                            </div>

                            <div>
                                <div className="text-xs text-slate-500">Converted Price</div>
                                <div className="text-lg font-semibold">
                                    {order.converted_price_mwk
                                        ? formatMWK(Number(order.converted_price_mwk))
                                        : '-'}
                                </div>
                            </div>

                            <div>
                                <div className="text-xs text-slate-500">Delivery Fee</div>
                                <div className="text-lg font-semibold">
                                    {order.delivery_fee_mwk
                                        ? formatMWK(Number(order.delivery_fee_mwk))
                                        : '-'}
                                </div>
                            </div>

                            <div>
                                <div className="text-xs text-slate-500">Total</div>
                                <div className="text-2xl font-bold">
                                    {order.total_mwk
                                        ? formatMWK(Number(order.total_mwk))
                                        : '-'}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* NOTES */}
                    <div className="bg-white p-6 rounded shadow">
                        <h3 className="text-lg font-semibold mb-3">Notes</h3>
                        <p className="text-slate-600">
                            {order.admin_notes ?? 'No admin notes for this order.'}
                        </p>
                    </div>
                </div>

                {/* RIGHT SIDE: UPDATE PANEL (REAL FUNCTIONALITY) */}
                <OrderUpdatePanel order={order} />
            </div>
        </div>
    )
}
