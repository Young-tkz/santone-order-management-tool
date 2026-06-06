// lib/email/templates.js

export function customerOrderTemplate({ order }) {
    return {
        subject: `Order Received — ${order.order_code}`,
        html: `
      <div style="font-family: system-ui, Arial; color:#111;">
        <h2>Order Received</h2>
        <p>Thanks ${order.customer_name}, we received your order.</p>
        <p><strong>Order ID:</strong> ${order.order_code}</p>
        <p><strong>Total:</strong> MWK ${Number(order.total_mwk).toLocaleString()}</p>
        <p>You can track your order here: <a href="${process.env.NEXT_PUBLIC_BASE_URL || ''}/order/success/${order.order_code}">Track Order</a></p>
        <hr/>
        <small>If you did not place this order, contact us at ${process.env.ADMIN_EMAIL}</small>
      </div>
    `
    }
}

export function adminOrderTemplate({ order }) {
    return {
        subject: `New Order — ${order.order_code}`,
        html: `
      <div style="font-family: system-ui, Arial; color:#111;">
        <h2>New Order Received</h2>
        <p><strong>Order ID:</strong> ${order.order_code}</p>
        <p><strong>Customer:</strong> ${order.customer_name} — ${order.customer_phone}</p>
        <p><strong>Total:</strong> MWK ${Number(order.total_mwk).toLocaleString()}</p>
        <p>View it in admin: <a href="${process.env.NEXT_PUBLIC_BASE_URL || ''}/admin/orders/${order.id}">Admin Order Link</a></p>
      </div>
    `
    }
}

/**
 * Status update email for customer
 * { order, previousStatus }
 */
export function statusUpdateCustomerTemplate({ order, previousStatus = null }) {
    const subject = `Order ${order.order_code} — status updated to ${order.status}`
    const html = `
      <div style="font-family: system-ui, Arial; color:#111;">
        <h2>Order Status Update</h2>
        <p>Hi ${order.customer_name},</p>
        <p>Your order <strong>${order.order_code}</strong> status changed ${previousStatus ? `from <strong>${previousStatus}</strong> ` : ''}to <strong>${order.status}</strong>.</p>
        <p><strong>Total:</strong> MWK ${Number(order.total_mwk || 0).toLocaleString()}</p>
        <p>You can view the order here: <a href="${process.env.NEXT_PUBLIC_BASE_URL || ''}/order/success/${order.order_code}">Track Order</a></p>
        <hr/>
        <small>If you believe this change is an error, contact us at ${process.env.ADMIN_EMAIL}</small>
      </div>
    `
    return { subject, html }
}

/**
 * Status update email for admin
 * { order, previousStatus }
 */
export function statusUpdateAdminTemplate({ order, previousStatus = null }) {
    const subject = `Order ${order.order_code} — status changed to ${order.status}`
    const html = `
      <div style="font-family: system-ui, Arial; color:#111;">
        <h2>Order Status Changed</h2>
        <p><strong>Order ID:</strong> ${order.order_code}</p>
        <p><strong>Customer:</strong> ${order.customer_name} — ${order.customer_phone}</p>
        <p>Status changed ${previousStatus ? `from <strong>${previousStatus}</strong> ` : ''}to <strong>${order.status}</strong>.</p>
        <p><strong>Total:</strong> MWK ${Number(order.total_mwk || 0).toLocaleString()}</p>
        <p>View it in admin: <a href="${process.env.NEXT_PUBLIC_BASE_URL || ''}/admin/orders/${order.id}">Admin Order Link</a></p>
      </div>
    `
    return { subject, html }
}
