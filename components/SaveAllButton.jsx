// components/SaveAllButton.jsx
'use client'

import { useState } from 'react'

export default function SaveAllButton() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    async function handleSaveAll() {
        setLoading(true)
        setError(null)

        try {
            // collect values from inputs by id (they exist in the settings page)
            const values = {
                business_name: document.getElementById('business_name')?.value ?? '',
                business_phone: document.getElementById('business_phone')?.value ?? '',
                delivery_fee_mwk: document.getElementById('delivery_fee_mwk')?.value ?? '',
                usd_to_mwk: document.getElementById('usd_to_mwk')?.value ?? '',
                gbp_to_mwk: document.getElementById('gbp_to_mwk')?.value ?? '',
                eur_to_mwk: document.getElementById('eur_to_mwk')?.value ?? '',
                cny_to_mwk: document.getElementById('cny_to_mwk')?.value ?? ''
            }

            const resp = await fetch('/api/admin/settings/update-all', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(values)
            })

            const json = await resp.json()
            if (resp.ok && json.ok) {
                // reload with success flag
                window.location.href = '/admin/settings?updated=1'
            } else {
                setError('Save failed')
                setLoading(false)
            }
        } catch (err) {
            console.error(err)
            setError('Unknown error')
            setLoading(false)
        }
    }

    return (
        <div className="flex items-center gap-3">
            <button
                onClick={handleSaveAll}
                disabled={loading}
                className="bg-green-800 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-60"
            >
                {loading ? 'Saving…' : 'Save all'}
            </button>
            {error && <div className="text-sm text-red-600">{error}</div>}
        </div>
    )
}
