// app/(admin)/admin/settings/page.jsx
import { supabase } from '@/lib/supabaseClient'
import SettingsClient from '@/components/SettingsClient'

export default async function SettingsPage({ searchParams }) {
    // fetch settings (server-side)
    const { data: settings, error } = await supabase
        .from('settings')
        .select('*')
        .limit(1)
        .single()

    // handle missing row gracefully by using defaults
    const s = settings || {
        business_name: 'Santone Enterprises',
        business_phone: '+265 997 047 607',
        delivery_fee_mwk: 25000,
        usd_to_mwk: 1250,
        gbp_to_mwk: 1350,
        eur_to_mwk: 1500,
        cny_to_mwk: 190
    }

    // unwrap searchParams (it may be a Promise)
    const sp = await searchParams
    const updated = String(sp?.updated || '') === '1'
    const failed = String(sp?.updated || '') === '0'

    return (
        <div>
            <h1 className="text-3xl font-bold mb-2">Settings</h1>
            <p className="text-slate-500 mb-6">Edit business settings (live — saves to Supabase).</p>

            {updated && (
                <div className="mb-4 text-sm text-green-700 bg-green-50 border border-green-100 p-3 rounded">
                    Settings updated successfully.
                </div>
            )}
            {failed && (
                <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-100 p-3 rounded">
                    Failed to update settings. Check server logs.
                </div>
            )}

            {/* client component handles the editable forms + Save All */}
            <SettingsClient initial={s} />
        </div>
    )
}
