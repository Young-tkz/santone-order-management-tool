// app/order/page.jsx
import OrderForm from '@/components/OrderForm'
import { supabase } from '@/lib/supabaseClient'

export default async function OrderPage() {
    // fetch settings (server-side)
    const { data: settings, error } = await supabase
        .from('settings')
        .select('*')
        .limit(1)
        .single()

    const s = settings || {
        delivery_fee_mwk: 25000,
        usd_to_mwk: 1250,
        gbp_to_mwk: 1350,
        eur_to_mwk: 1500,
        cny_to_mwk: 190
    }


    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
            <div className="max-w-3xl w-full">
                <header className="text-center mb-6">
                    <h1 className="text-3xl font-bold text-green-950 mb-4">Santone Enterprises</h1>
                    <h2 className="text-xl font-bold text-slate-800">Order from UK, USA & Beyond</h2>
                    <p className="text-sm text-slate-600 mt-2">Paste a product link, enter the price and we will calculate the total in MWK.</p>
                </header>

                <main className="bg-white p-6 rounded shadow">
                    <OrderForm initialSettings={s} />
                </main>
            </div>
        </div>
    )
}
