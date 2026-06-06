import { Suspense } from 'react'
import TrackClient from './TrackClient'

export default async function TrackPage({ searchParams }) {
    const sp = await searchParams
    const orderId = sp?.orderId || ''

    return (
        <Suspense fallback={<div className="p-8">Loading...</div>}>
            <TrackClient initialOrderId={orderId} />
        </Suspense>
    )
}
