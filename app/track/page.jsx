// app/track/page.jsx
'use client'

import React, { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'

function formatMWK(v) {
    return typeof v === 'number' ? `MWK ${Number(v).toLocaleString()}` : v ? `MWK ${Number(v).toLocaleString()}` : '-'
}
function formatUSD(v) {
    return typeof v === 'number' ? `$${Number(v).toFixed(2)}` : v ? `$${Number(v).toFixed(2)}` : '-'
}

/** Simple status -> step index mapping */
const STATUS_STEPS = ['pending', 'quoted', 'ordered', 'shipped', 'arriving', 'delivered']

function ProgressBar({ status }) {
    const idx = Math.max(0, STATUS_STEPS.indexOf((status || '').toLowerCase()))
    return (
        <div className="mt-4">
            <div className="flex items-center gap-4">
                {STATUS_STEPS.map((s, i) => {
                    const active = i <= idx
                    return (
                        <div key={s} className="flex-1 text-center">
                            <div
                                className={`mx-auto w-9 h-9 rounded-full flex items-center justify-center font-semibold ${
                                    active ? 'bg-green-700 text-white' : 'bg-slate-100 text-slate-500'
                                }`}
                            >
                                {active ? '✓' : i + 1}
                            </div>
                            <div className={`mt-2 text-xs ${active ? 'text-slate-700' : 'text-slate-400'}`}>{s.charAt(0).toUpperCase() + s.slice(1)}</div>
                        </div>
                    )
                })}
            </div>
            <div className="h-1 bg-slate-100 relative mt-3">
                <div
                    style={{ width: `${((Math.max(0, STATUS_STEPS.indexOf((status || '').toLowerCase())) + 1) / STATUS_STEPS.length) * 100}%` }}
                    className="absolute top-0 left-0 h-1 bg-green-600"
                />
            </div>
        </div>
    )
}

export default function TrackPage() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const initialOrderId = searchParams?.get('orderId') || ''
    const [orderId, setOrderId] = useState(initialOrderId)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [order, setOrder] = useState(null)

    useEffect(() => {
        // auto-run if ?orderId=... present
        if (initialOrderId) {
            lookupOrder(initialOrderId)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialOrderId])

    async function lookupOrder(id) {
        setError(null)
        setOrder(null)

        if (!id || !id.trim()) {
            setError('Please enter an Order ID.')
            return
        }

        setLoading(true)
        try {
            const res = await fetch(`/api/orders/lookup?orderId=${encodeURIComponent(id.trim())}`)
            const json = await res.json()
            if (!res.ok || !json.ok) {
                setError(json?.message || 'Order not found.')
                setOrder(null)
            } else {
                setOrder(json.order)
                setError(null)
                // update the URL so it can be shared
                const url = new URL(window.location.href)
                url.searchParams.set('orderId', id.trim())
                window.history.replaceState({}, '', url.toString())
            }
        } catch (err) {
            console.error('lookup error', err)
            setError('Network error. Check your connection.')
        } finally {
            setLoading(false)
        }
    }

    function onSubmit(e) {
        e.preventDefault()
        lookupOrder(orderId)
    }

    return (
        <div className="p-8">
            <div className="max-w-3xl mx-auto text-slate-800">
                <h1 className="text-3xl font-bold mb-2">Track your order</h1>
                <p className="text-slate-600 mb-6">Enter your Order ID to view the current status</p>

                <form onSubmit={onSubmit} className="bg-white p-4 rounded shadow mb-6 flex gap-3">
                    <input
                        value={orderId}
                        onChange={(e) => setOrderId(e.target.value)}
                        placeholder="SNT-ABC123 or SNT54TIE9"
                        className="flex-1 border rounded px-3 py-2"
                        aria-label="Order ID"
                    />
                    <button type="submit" className="bg-green-700 text-white px-4 py-2 rounded">
                        {loading ? 'Searching...' : 'Track Order'}
                    </button>
                </form>

                {error && (
                    <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-100 p-3 rounded">
                        {error}
                    </div>
                )}

                {order && (
                    <div className="bg-white p-6 rounded shadow">
                        <div className="flex items-start justify-between">
                            <div>
                                <h2 className="text-xl font-semibold">Order #{order.order_code}</h2>
                                <div className="text-slate-500">Estimated arrival: 7 business days</div>
                            </div>
                            <div>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                  {order.status ?? 'pending'}
                </span>
                            </div>
                        </div>

                        <h3 className="mt-6 text-sm text-slate-600">Order Progress</h3>
                        <ProgressBar status={order.status} />

                        <h3 className="mt-6 text-lg font-semibold">Order Details</h3>

                        {order.product_link && (
                            <div className="mt-4 p-4 border rounded bg-slate-50">
                                <div className="text-xs text-slate-600 mb-2 flex items-center gap-2">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="inline-block">
                                        <path d="M3 12a9 9 0 1118 0" stroke="#10B981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                                    </svg>
                                    Product Link
                                </div>
                                <a href={order.product_link} target="_blank" rel="noreferrer" className="text-green-700 hover:underline">
                                    {order.product_link}
                                </a>
                            </div>
                        )}

                        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <div className="text-xs text-slate-500">Item Price</div>
                                <div className="font-semibold">{formatUSD(Number(order.item_price || 0))}</div>
                            </div>

                            <div>
                                <div className="text-xs text-slate-500">Converted Price</div>
                                <div className="font-semibold">{order.converted_price_mwk ? formatMWK(Number(order.converted_price_mwk)) : '-'}</div>
                            </div>

                            <div>
                                <div className="text-xs text-slate-500">Delivery Fee</div>
                                <div className="font-semibold">{order.delivery_fee_mwk ? formatMWK(Number(order.delivery_fee_mwk)) : '-'}</div>
                            </div>

                            <div>
                                <div className="text-xs text-slate-500">Total</div>
                                <div className="text-2xl font-bold">{order.total_mwk ? formatMWK(Number(order.total_mwk)) : '-'}</div>
                            </div>
                        </div>

                        <div className="mt-6">
                            <h4 className="text-sm font-semibold mb-2">Customer</h4>
                            <div className="text-sm">{order.customer_name}</div>
                        </div>
                    </div>
                )}

                {!order && !error && (
                    <div className="mt-8 text-sm text-slate-500">
                        Or, if you have just placed an order, use the Order ID from the confirmation page.
                    </div>
                )}
            </div>
        </div>
    )
}
