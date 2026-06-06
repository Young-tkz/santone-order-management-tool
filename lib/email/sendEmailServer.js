// lib/email/sendEmailServer.js
const RESEND_API_URL = 'https://api.resend.com/emails'

export async function sendEmailResend({ to, from, subject, html, text }) {
    if (!process.env.RESEND_API_KEY) {
        console.warn('RESEND_API_KEY missing, skipping email send')
        return { ok: false, error: 'missing-key' }
    }

    const body = {
        from,
        to,
        subject,
        html
    }

    try {
        const res = await fetch(RESEND_API_URL, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        })

        const data = await res.json()
        if (!res.ok) {
            console.error('Resend error', data)
            return { ok: false, error: data }
        }
        return { ok: true, data }
    } catch (err) {
        console.error('sendEmailResend failed', err)
        return { ok: false, error: err }
    }
}
