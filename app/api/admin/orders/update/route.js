// app/api/admin/orders/update/route.js
import { supabase } from '@/lib/supabaseClient'
import { sendEmailResend } from '@/lib/email/sendEmailServer'
import { statusUpdateCustomerTemplate, statusUpdateAdminTemplate } from '@/lib/email/templates'

export async function POST(req) {
    try {
        const body = await req.json()
        const id = String(body.id || '')
        const status = body.status ? String(body.status) : null
        const admin_notes = body.admin_notes !== undefined ? String(body.admin_notes) : null

        if (!id) {
            return new Response(JSON.stringify({ ok: false, error: 'Missing order id' }), { status: 400 })
        }

        // 1) read existing order so we can compare previous status and have order data
        const { data: existingOrder, error: fetchError } = await supabase
            .from('orders')
            .select('*')
            .eq('id', id)
            .single()

        if (fetchError || !existingOrder) {
            console.error('Could not fetch existing order before update', fetchError)
            return new Response(JSON.stringify({ ok: false, error: 'Order not found' }), { status: 404 })
        }

        const prevStatus = existingOrder.status ?? null

        // build payload (only include provided fields)
        const payload = {}
        if (status !== null) payload.status = status
        if (admin_notes !== null) payload.admin_notes = admin_notes
        payload.updated_at = new Date().toISOString()

        // 2) update and return updated row
        const { data: updatedRows, error: updateError } = await supabase
            .from('orders')
            .update(payload)
            .eq('id', id)
            .select('*') // return the updated row(s)

        if (updateError) {
            console.error('Failed to update order', updateError)
            return new Response(JSON.stringify({ ok: false, error: updateError }), { status: 500 })
        }

        // supabase returns an array for update + select; we want single updated row
        const updatedOrder = Array.isArray(updatedRows) ? updatedRows[0] : updatedRows

        // 3) If status changed (and new status is provided), send emails (best-effort)
        const newStatus = status !== null ? status : prevStatus
        if (status !== null && prevStatus !== newStatus) {
            try {
                // build templates
                const customerTpl = statusUpdateCustomerTemplate({ order: updatedOrder, previousStatus: prevStatus })
                const adminTpl = statusUpdateAdminTemplate({ order: updatedOrder, previousStatus: prevStatus })

                // send customer email (don't block — best effort)
                if (updatedOrder.customer_email) {
                    sendEmailResend({
                        to: updatedOrder.customer_email,
                        from: process.env.FROM_EMAIL,
                        subject: customerTpl.subject,
                        html: customerTpl.html
                    }).catch(e => console.error('Failed to send customer status email', e))
                } else {
                    console.warn('No customer email on order', updatedOrder.id)
                }

                // send admin email
                if (process.env.ADMIN_EMAIL) {
                    sendEmailResend({
                        to: process.env.ADMIN_EMAIL,
                        from: process.env.FROM_EMAIL,
                        subject: adminTpl.subject,
                        html: adminTpl.html
                    }).catch(e => console.error('Failed to send admin status email', e))
                } else {
                    console.warn('No ADMIN_EMAIL configured in env')
                }
            } catch (e) {
                // ensure email failures don't break API response
                console.error('Error building/sending status-change emails', e)
            }
        }

        return new Response(JSON.stringify({ ok: true, order: updatedOrder }), { status: 200 })
    } catch (err) {
        console.error('Order update API error', err)
        return new Response(JSON.stringify({ ok: false, error: String(err) }), { status: 500 })
    }
}
