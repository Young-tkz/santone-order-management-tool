// app/api/orders/lookup/route.js
import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'

export async function GET(req) {
    try {
        const url = new URL(req.url)
        const orderId = url.searchParams.get('orderId')

        if (!orderId) {
            return NextResponse.json({ ok: false, message: 'missing orderId' }, { status: 400 })
        }

        const { data: order, error } = await supabase
            .from('orders')
            .select('*')
            .eq('order_code', orderId)
            .single()

        if (error || !order) {
            return NextResponse.json({ ok: false, message: 'not found' }, { status: 404 })
        }

        return NextResponse.json({ ok: true, order })
    } catch (err) {
        console.error('lookup route error', err)
        return NextResponse.json({ ok: false, message: 'server error' }, { status: 500 })
    }
}
