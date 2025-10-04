import nodemailer from 'nodemailer'

// Create reusable transporter object using SMTP transport
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  })
}

interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

export const sendEmail = async (options: EmailOptions) => {
  try {
    const transporter = createTransporter()
    const fromAddress = process.env.EMAIL_FROM || process.env.EMAIL_USER

    if (!fromAddress) {
      throw new Error("Email sender address is not configured. Please set EMAIL_FROM or EMAIL_USER.")
    }
    
    const mailOptions = {
      from: fromAddress,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    }

    const info = await transporter.sendMail(mailOptions)
    console.log('Email sent: ', info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error('Error sending email: ', error)
    return { success: false, error }
  }
}

// Email templates
export const generatePaymentSuccessEmail = (orderDetails: {
  orderId: string
  customerName: string
  customerEmail: string
  amount: number
  currency: string
  products: Array<{
    title: string
    quantity: number
    price: number
  }>
  shippingAddress?: string
}) => {
  const { orderId, customerName, amount, currency, products, shippingAddress } = orderDetails

  return {
    subject: `✅ Payment Successful - Order #${orderId} | ShopMate`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Payment Successful</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f8f9fa; }
          .container { max-width: 600px; margin: 0 auto; background: white; }
          .header { background: linear-gradient(135deg, #ff6b35 0%, #f7931e 50%, #8b5cf6 100%); color: white; padding: 30px 20px; text-align: center; }
          .header h1 { margin: 0; font-size: 28px; }
          .content { padding: 30px 20px; }
          .success-icon { font-size: 60px; text-align: center; margin: 20px 0; }
          .order-summary { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .product-item { border-bottom: 1px solid #e9ecef; padding: 12px 0; display: flex; justify-content: space-between; }
          .product-item:last-child { border-bottom: none; }
          .total { font-weight: bold; font-size: 18px; color: #28a745; }
          .footer { background: #343a40; color: white; padding: 20px; text-align: center; }
          .btn { display: inline-block; padding: 12px 24px; background: #ff6b35; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🛍️ ShopMate</h1>
            <p>Thank you for your purchase!</p>
          </div>
          
          <div class="content">
            <div class="success-icon">✅</div>
            <h2 style="color: #28a745; text-align: center;">Payment Successful!</h2>
            
            <p>Dear <strong>${customerName}</strong>,</p>
            <p>Your payment has been processed successfully. Here are your order details:</p>
            
            <div class="order-summary">
              <h3>📦 Order Summary</h3>
              <p><strong>Order ID:</strong> #${orderId}</p>
              <p><strong>Amount Paid:</strong> ${amount} ${currency}</p>
              ${shippingAddress ? `<p><strong>Shipping Address:</strong> ${shippingAddress}</p>` : ''}
              
              <h4>Items Ordered:</h4>
              ${products.map(product => `
                <div class="product-item">
                  <span>${product.title} (x${product.quantity})</span>
                  <span>${product.price * product.quantity} ${currency}</span>
                </div>
              `).join('')}
              
              <div class="product-item total">
                <span>Total Amount</span>
                <span>${amount} ${currency}</span>
              </div>
            </div>
            
            <p>🚚 Your order is being processed and will be shipped within 2-3 business days.</p>
            <p>📧 You will receive a tracking notification once your order is dispatched.</p>
            
            <div style="text-align: center;">
              <a href="${process.env.NEXT_PUBLIC_BASE_URL}/orders" class="btn">Track Your Order</a>
            </div>
            
            <p>If you have any questions, please don't hesitate to contact our customer support.</p>
          </div>
          
          <div class="footer">
            <p>&copy; 2025 ShopMate. All rights reserved.</p>
            <p>Thank you for choosing ShopMate!</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      Payment Successful - ShopMate
      
      Dear ${customerName},
      
      Your payment has been processed successfully!
      
      Order Details:
      - Order ID: #${orderId}
      - Amount Paid: ${amount} ${currency}
      ${shippingAddress ? `- Shipping Address: ${shippingAddress}` : ''}
      
      Items Ordered:
      ${products.map(product => `- ${product.title} (x${product.quantity}): ${product.price * product.quantity} ${currency}`).join('\n')}
      
      Total Amount: ${amount} ${currency}
      
      Your order is being processed and will be shipped within 2-3 business days.
      Track your order: ${process.env.NEXT_PUBLIC_BASE_URL}/orders
      
      Thank you for choosing ShopMate!
    `
  }
}

export const generatePaymentFailureEmail = (orderDetails: {
  orderId: string
  customerName: string
  customerEmail: string
  amount: number
  currency: string
  failureReason?: string
}) => {
  const { orderId, customerName, amount, currency, failureReason } = orderDetails

  return {
    subject: `❌ Payment Failed - Order #${orderId} | ShopMate`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Payment Failed</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f8f9fa; }
          .container { max-width: 600px; margin: 0 auto; background: white; }
          .header { background: linear-gradient(135deg, #dc3545 0%, #f7931e 50%, #8b5cf6 100%); color: white; padding: 30px 20px; text-align: center; }
          .header h1 { margin: 0; font-size: 28px; }
          .content { padding: 30px 20px; }
          .error-icon { font-size: 60px; text-align: center; margin: 20px 0; }
          .order-info { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .footer { background: #343a40; color: white; padding: 20px; text-align: center; }
          .btn { display: inline-block; padding: 12px 24px; background: #dc3545; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .retry-btn { background: #28a745; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🛍️ ShopMate</h1>
            <p>Payment Processing Issue</p>
          </div>
          
          <div class="content">
            <div class="error-icon">❌</div>
            <h2 style="color: #dc3545; text-align: center;">Payment Failed</h2>
            
            <p>Dear <strong>${customerName}</strong>,</p>
            <p>Unfortunately, we were unable to process your payment. Please review the details below:</p>
            
            <div class="order-info">
              <h3>💳 Payment Details</h3>
              <p><strong>Order ID:</strong> #${orderId}</p>
              <p><strong>Amount:</strong> ${amount} ${currency}</p>
              ${failureReason ? `<p><strong>Reason:</strong> ${failureReason}</p>` : ''}
            </div>
            
            <h3>🔧 What can you do?</h3>
            <ul>
              <li>✅ Check your payment method details</li>
              <li>💰 Ensure sufficient funds in your account</li>
              <li>🌐 Verify your internet connection</li>
              <li>📱 Contact your bank if the issue persists</li>
            </ul>
            
            <p>Your items are still reserved in your cart. You can retry the payment anytime within the next 24 hours.</p>
            
            <div style="text-align: center;">
              <a href="${process.env.NEXT_PUBLIC_BASE_URL}/cart" class="btn retry-btn">Retry Payment</a>
              <a href="${process.env.NEXT_PUBLIC_BASE_URL}/contact" class="btn">Contact Support</a>
            </div>
            
            <p>If you continue to experience issues, our customer support team is here to help.</p>
          </div>
          
          <div class="footer">
            <p>&copy; 2025 ShopMate. All rights reserved.</p>
            <p>Need help? Contact us at support@shopmate.com</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      Payment Failed - ShopMate
      
      Dear ${customerName},
      
      Unfortunately, we were unable to process your payment.
      
      Payment Details:
      - Order ID: #${orderId}
      - Amount: ${amount} ${currency}
      ${failureReason ? `- Reason: ${failureReason}` : ''}
      
      What can you do?
      - Check your payment method details
      - Ensure sufficient funds in your account
      - Verify your internet connection
      - Contact your bank if the issue persists
      
      Your items are still reserved in your cart. Retry payment: ${process.env.NEXT_PUBLIC_BASE_URL}/cart
      
      Need help? Contact support: ${process.env.NEXT_PUBLIC_BASE_URL}/contact
      
      ShopMate Customer Support
    `
  }
}