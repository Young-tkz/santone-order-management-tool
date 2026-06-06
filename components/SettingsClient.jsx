// components/SettingsClient.jsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SettingsClient({ initial = {} }) {
    const router = useRouter()
    const [form, setForm] = useState({
        business_name: initial.business_name ?? '',
        business_phone: initial.business_phone ?? '',
        delivery_fee_mwk: initial.delivery_fee_mwk ?? 25000,
        usd_to_mwk: initial.usd_to_mwk ?? 1250,
        gbp_to_mwk: initial.gbp_to_mwk ?? 1350,
        eur_to_mwk: initial.eur_to_mwk ?? 1500,
        cny_to_mwk: initial.cny_to_mwk ?? 190
    })
    const [loading, setLoading] = useState(false)

    function updateField(k, v) {
        setForm((s) => ({ ...s, [k]: v }))
    }

    async function saveAll(e) {
        e?.preventDefault()
        setLoading(true)
        try {
            const res = await fetch('/api/admin/settings/update-all', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            })
            const json = await res.json()
            if (res.ok && json.ok) {
                // small success toast - replace with your toast if you have one
                alert('Settings saved successfully.')
                // refresh server data
                router.refresh()
            } else {
                console.error('Settings save failed', json)
                alert('Failed to save settings. Check console.')
            }
        } catch (err) {
            console.error(err)
            alert('Request failed. Check console.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div>
            <div className="flex justify-end mb-4">
                <button
                    onClick={saveAll}
                    disabled={loading}
                    className="bg-green-700 text-white px-4 py-2 rounded hover:bg-green-800 disabled:opacity-60"
                >
                    {loading ? 'Saving…' : 'Save all'}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded shadow">
                    <h2 className="text-xl font-semibold mb-4">Business Information</h2>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm text-slate-700 mb-1">Business name</label>
                            <input
                                value={form.business_name}
                                onChange={(e) => updateField('business_name', e.target.value)}
                                className="w-full border rounded px-3 py-2"
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-slate-700 mb-1">Business phone</label>
                            <input
                                value={form.business_phone}
                                onChange={(e) => updateField('business_phone', e.target.value)}
                                className="w-full border rounded px-3 py-2"
                            />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded shadow">
                    <h2 className="text-xl font-semibold mb-4">Delivery & Currency</h2>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm text-slate-700 mb-1">Delivery fee (MWK)</label>
                            <input
                                type="number"
                                value={form.delivery_fee_mwk}
                                onChange={(e) => updateField('delivery_fee_mwk', Number(e.target.value))}
                                className="w-full border rounded px-3 py-2"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3 mt-2">
                            <div className="bg-slate-50 p-3 rounded">
                                <label className="block text-xs text-slate-500">USD → MWK</label>
                                <input
                                    type="number"
                                    value={form.usd_to_mwk}
                                    onChange={(e) => updateField('usd_to_mwk', Number(e.target.value))}
                                    className="w-full border rounded px-2 py-1 mt-2"
                                />
                            </div>

                            <div className="bg-slate-50 p-3 rounded">
                                <label className="block text-xs text-slate-500">GBP → MWK</label>
                                <input
                                    type="number"
                                    value={form.gbp_to_mwk}
                                    onChange={(e) => updateField('gbp_to_mwk', Number(e.target.value))}
                                    className="w-full border rounded px-2 py-1 mt-2"
                                />
                            </div>

                            <div className="bg-slate-50 p-3 rounded">
                                <label className="block text-xs text-slate-500">EUR → MWK</label>
                                <input
                                    type="number"
                                    value={form.eur_to_mwk}
                                    onChange={(e) => updateField('eur_to_mwk', Number(e.target.value))}
                                    className="w-full border rounded px-2 py-1 mt-2"
                                />
                            </div>

                            <div className="bg-slate-50 p-3 rounded">
                                <label className="block text-xs text-slate-500">CNY → MWK</label>
                                <input
                                    type="number"
                                    value={form.cny_to_mwk}
                                    onChange={(e) => updateField('cny_to_mwk', Number(e.target.value))}
                                    className="w-full border rounded px-2 py-1 mt-2"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <p className="text-slate-500 mt-6 text-sm">
                Tip: Save all updates everything at once. You can still keep per-section save buttons if you prefer.
            </p>
        </div>
    )
}
