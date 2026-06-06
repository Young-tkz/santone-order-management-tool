// components/OrderForm.jsx
'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'

export default function OrderForm({ initialSettings }) {
    const router = useRouter()

    const [name, setName] = useState('')
    const [phone, setPhone] = useState('')
    const [email, setEmail] = useState('')
    const [productLink, setProductLink] = useState('')
    const [itemPrice, setItemPrice] = useState('')
    const [currency, setCurrency] = useState('USD')
    const [loading, setLoading] = useState(false)
    const [errors, setErrors] = useState({})

    const rates = {
        USD: initialSettings.usd_to_mwk,
        GBP: initialSettings.gbp_to_mwk,
        EUR: initialSettings.eur_to_mwk,
        CNY: initialSettings.cny_to_mwk
    }
    const deliveryFee = Number(initialSettings.delivery_fee_mwk || 0)

    const parsedPrice = Number(itemPrice || 0)
    const rate = rates[currency] || 1

    const convertedPrice = useMemo(() => {
        if (!parsedPrice || !rate) return 0
        return parsedPrice * rate
    }, [parsedPrice, rate])

    const total = useMemo(() => {
        return Math.round(convertedPrice + deliveryFee)
    }, [convertedPrice, deliveryFee])

    function validate() {
        const e = {}
        if (!name.trim()) e.name = 'Name is required'
        if (!phone.trim()) e.phone = 'Phone is required'
        if (!email.trim()) e.email = 'Email is required'
        if (!productLink.trim()) e.productLink = 'Product link is required'
        if (!itemPrice || Number.isNaN(Number(itemPrice))) e.itemPrice = 'Enter a valid price'
        setErrors(e)
        return Object.keys(e).length === 0
    }

    async function handlePlaceOrder(e) {
        e.preventDefault()
        if (!validate()) return
        setLoading(true)
        try {
            const payload = {
                customer_name: name,
                customer_phone: phone,
                customer_email: email,
                product_link: productLink,
                item_price: Number(itemPrice),
                currency,
                converted_price_mwk: Math.round(convertedPrice),
                delivery_fee_mwk: deliveryFee,
                total_mwk: total
            }

            const res = await fetch('/api/orders/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })

            const json = await res.json()
            if (res.ok && json.ok && json.orderId) {
                // redirect to success page
                router.push(`/order/success/${json.orderId}`)
            } else {
                alert('Failed to create order. Check console.')
                console.error(json)
            }
        } catch (err) {
            console.error(err)
            alert('Request failed. Check console.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handlePlaceOrder} className="grid gap-4 text-slate-800">
            <div className="grid sm:grid-cols-2 gap-3">
                <div>
                    <label className="block text-sm text-slate-600">Full name</label>
                    <input value={name} onChange={(e)=>setName(e.target.value)} className="w-full border rounded px-3 py-2" />
                    {errors.name && <div className="text-xs text-red-600 mt-1">{errors.name}</div>}
                </div>

                <div>
                    <label className="block text-sm text-slate-600">Phone number</label>
                    <input value={phone} onChange={(e)=>setPhone(e.target.value)} className="w-full border rounded px-3 py-2" />
                    {errors.phone && <div className="text-xs text-red-600 mt-1">{errors.phone}</div>}
                </div>
            </div>

            <div>
                <label className="block text-sm text-slate-600">Email</label>
                <input value={email} onChange={(e)=>setEmail(e.target.value)} className="w-full border rounded px-3 py-2" />
                {errors.email && <div className="text-xs text-red-600 mt-1">{errors.email}</div>}
            </div>

            <div>
                <label className="block text-sm text-slate-600">Product link</label>
                <input value={productLink} onChange={(e)=>setProductLink(e.target.value)} className="w-full border rounded px-3 py-2" />
                {errors.productLink && <div className="text-xs text-red-600 mt-1">{errors.productLink}</div>}
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
                <div>
                    <label className="block text-sm text-slate-600">Item price</label>
                    <input value={itemPrice} onChange={(e)=>setItemPrice(e.target.value)} type="number" className="w-full border rounded px-3 py-2" />
                    {errors.itemPrice && <div className="text-xs text-red-600 mt-1">{errors.itemPrice}</div>}
                </div>

                <div>
                    <label className="block text-sm text-slate-600">Currency</label>
                    <select value={currency} onChange={(e)=>setCurrency(e.target.value)} className="w-full border rounded px-3 py-2">
                        <option value="USD">USD</option>
                        <option value="GBP">GBP</option>
                        <option value="CNY">CNY</option>
                        <option value="EUR">EUR</option>
                    </select>
                </div>
            </div>

            {/* Price breakdown */}
            <div className="bg-slate-50 p-4 rounded border">
                <div className="flex justify-between text-sm text-slate-600">
                    <div>Item price ({currency})</div>
                    <div>{Number(itemPrice || 0).toLocaleString()} {currency}</div>
                </div>

                <div className="flex justify-between text-sm text-slate-600 mt-2">
                    <div>Converted price (MWK)</div>
                    <div>MWK {Math.round(convertedPrice).toLocaleString()}</div>
                </div>

                <div className="flex justify-between text-sm text-slate-600 mt-2">
                    <div>Delivery fee</div>
                    <div>MWK {deliveryFee.toLocaleString()}</div>
                </div>

                <div className="flex justify-between text-lg font-bold mt-3">
                    <div>Total (MWK)</div>
                    <div>MWK {total.toLocaleString()}</div>
                </div>
            </div>

            <div className="flex items-center gap-3">
                <button type="submit" disabled={loading} className="bg-green-700 text-white px-4 py-2 rounded disabled:opacity-60 cursor-pointer">
                    {loading ? 'Placing…' : 'Place Order'}
                </button>
                <button type="button" onClick={() => {
                    // quick calculate (client-side)
                    if (!validate()) {
                        alert('Please fill required fields before calculating')
                    }
                }} className="px-3 py-2 border rounded cursor-pointer">Calculate Total</button>
            </div>
        </form>
    )
}
