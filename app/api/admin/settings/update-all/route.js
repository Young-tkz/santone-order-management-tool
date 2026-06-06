// app/api/admin/settings/update-all/route.js
import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'

export async function POST(req) {
    try {
        const body = await req.json()

        // read existing settings
        const { data: existing, error: fetchError } = await supabase
            .from('settings')
            .select('*')
            .limit(1)
            .single()

        if (fetchError && fetchError.code !== 'PGRST116') {
            console.error('Error reading settings (update-all):', fetchError)
            return NextResponse.json({ ok: false }, { status: 500 })
        }

        // Build payload by merging existing row with provided body.
        // Only override fields that are provided in `body`.
        const payload = {}

        // Strings: business_name, business_phone
        if ('business_name' in body) payload.business_name = body.business_name
        if ('business_phone' in body) payload.business_phone = body.business_phone

        // Numbers: parse only when value is not null/empty
        const parseNumber = (val) => {
            if (val === null || val === undefined || val === '') return undefined
            const n = Number(val)
            return Number.isFinite(n) ? n : undefined
        }

        const delivery_fee_mwk = parseNumber(body.delivery_fee_mwk)
        if (delivery_fee_mwk !== undefined) payload.delivery_fee_mwk = delivery_fee_mwk

        const usd_to_mwk = parseNumber(body.usd_to_mwk)
        if (usd_to_mwk !== undefined) payload.usd_to_mwk = usd_to_mwk

        const gbp_to_mwk = parseNumber(body.gbp_to_mwk)
        if (gbp_to_mwk !== undefined) payload.gbp_to_mwk = gbp_to_mwk

        const eur_to_mwk = parseNumber(body.eur_to_mwk)
        if (eur_to_mwk !== undefined) payload.eur_to_mwk = eur_to_mwk

        const cny_to_mwk = parseNumber(body.cny_to_mwk)
        if (cny_to_mwk !== undefined) payload.cny_to_mwk = cny_to_mwk

        payload.updated_at = new Date().toISOString()

        if (existing && existing.id) {
            const { error } = await supabase.from('settings').update(payload).eq('id', existing.id)
            if (error) {
                console.error('Failed to update settings (update-all):', error)
                return NextResponse.json({ ok: false }, { status: 500 })
            }
        } else {
            const { error } = await supabase.from('settings').insert(payload)
            if (error) {
                console.error('Failed to insert settings (update-all):', error)
                return NextResponse.json({ ok: false }, { status: 500 })
            }
        }

        return NextResponse.json({ ok: true })
    } catch (err) {
        console.error('Error in update-all route:', err)
        return NextResponse.json({ ok: false }, { status: 500 })
    }
}
