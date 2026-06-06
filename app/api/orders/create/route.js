// app/api/orders/create/route.js
import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'
import { sendEmailResend } from '@/lib/email/sendEmailServer'
import { customerOrderTemplate, adminOrderTemplate } from '@/lib/email/templates'

// simple generator for order code
function generateOrderCode() {
    const id = Math.random().toString(36).slice(2, 8).toUpperCase()
    return `SNT-${id}`
}

export async function POST(req) {
    try {
        const body = await req.json()

        // basic validation
        const required = [
            'customer_name',
            'customer_phone',
            'customer_email',
            'product_link',
            'item_price',
            'currency',
            'converted_price_mwk',
            'delivery_fee_mwk',
            'total_mwk'
        ]
        for (const k of required) {
            if (!(k in body)) {
                return NextResponse.json({ ok: false, error: `Missing ${k}` }, { status: 400 })
            }
        }

        // build row for insert
        const orderCode = generateOrderCode()
        const row = {
            order_code: orderCode,
            customer_name: body.customer_name,
            customer_phone: body.customer_phone,
            customer_email: body.customer_email,
            product_link: body.product_link,
            item_price: body.item_price,
            currency: body.currency,
            converted_price_mwk: body.converted_price_mwk,
            delivery_fee_mwk: body.delivery_fee_mwk,
            total_mwk: body.total_mwk,
            status: 'pending'
        }

        // insert into Supabase
        const { data, error } = await supabase
            .from('orders')
            .insert(row)
            .select()
            .single()

        if (error) {
            console.error('Failed to insert order:', error)
            return NextResponse.json({ ok: false, error }, { status: 500 })
        }

        const newOrder = data

        // Build email templates
        try {
            const cust = customerOrderTemplate({ order: newOrder })
            const admin = adminOrderTemplate({ order: newOrder })

            // send customer email (best effort — don't block response)
            sendEmailResend({
                to: newOrder.customer_email,
                from: process.env.FROM_EMAIL,
                subject: cust.subject,
                html: cust.html
            }).catch((e) => console.error('customer email failed:', e))

            // send admin email
            sendEmailResend({
                to: process.env.ADMIN_EMAIL,
                from: process.env.FROM_EMAIL,
                subject: admin.subject,
                html: admin.html
            }).catch((e) => console.error('admin email failed:', e))
        } catch (emailErr) {
            // Keep order creation resilient — log and move on
            console.error('Error preparing/sending emails:', emailErr)
        }

        // return success with the public order code
        return NextResponse.json({ ok: true, orderId: newOrder.order_code, order: newOrder })
    } catch (err) {
        console.error('Order create error', err)
        return NextResponse.json({ ok: false, error: String(err) }, { status: 500 })
    }
}
