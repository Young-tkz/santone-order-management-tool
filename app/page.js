import Link from 'next/link'

export default function HomePage() {
    return (
        <main className="min-h-screen bg-white flex items-center justify-center px-6">
            <div className="max-w-2xl text-center">
                <h1 className="text-5xl font-bold text-green-700 mb-4">
                    Santone Enterprises
                </h1>

                <p className="text-xl text-slate-600 mb-8">
                    Order products from the UK, USA, China and beyond. We handle
                    the purchasing and delivery process for you.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                        href="/order"
                        className="bg-green-700 text-white px-6 py-3 rounded-lg hover:bg-green-800"
                    >
                        Place an Order
                    </Link>

                    <Link
                        href="/track"
                        className="border border-green-700 text-green-700 px-6 py-3 rounded-lg hover:bg-green-50"
                    >
                        Track an Order
                    </Link>
                </div>

                <div className="mt-10 text-sm text-slate-500">
                    Fast • Secure • Reliable
                </div>
            </div>
        </main>
    )
}
