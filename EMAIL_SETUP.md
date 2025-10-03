# Email Notification Setup Guide

## Overview
This guide explains how to set up email notifications for payment success and failure events in your ShopMate e-commerce application.

## Features
- ✅ **Payment Success Emails**: Sent when payment is completed successfully
- ❌ **Payment Failure Emails**: Sent when payment fails or is cancelled
- 🎨 **Beautiful HTML Templates**: Professional email designs with ShopMate branding
- 📱 **Responsive Design**: Emails look great on all devices

## Setup Instructions

### 1. Configure Environment Variables

Add the following variables to your `.env.local` and `.env.production` files:

```bash
# Email Configuration (Nodemailer)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=ShopMate <noreply@shopmate.com>
```

### 2. Gmail Setup (Recommended)

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password**:
   - Go to Google Account Settings
   - Security → 2-Step Verification → App Passwords
   - Generate a new app password for "Mail"
   - Use this password in `EMAIL_PASS`

### 3. Alternative Email Providers

#### Using SendGrid
```bash
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASS=your-sendgrid-api-key
EMAIL_FROM=ShopMate <noreply@yourdomain.com>
```

#### Using Mailgun
```bash
EMAIL_HOST=smtp.mailgun.org
EMAIL_PORT=587
EMAIL_USER=postmaster@yourdomain.com
EMAIL_PASS=your-mailgun-password
EMAIL_FROM=ShopMate <noreply@yourdomain.com>
```

## Email Templates

### Success Email Features
- Order confirmation with order number
- Itemized product list with quantities and prices
- Shipping address details
- Order tracking link
- Professional ShopMate branding

### Failure Email Features
- Clear failure notification
- Failure reason explanation
- Retry payment button
- Customer support contact information
- Cart recovery link

## Testing

### Manual Test Endpoint
Test email functionality using the API endpoint:

```bash
POST /api/test-email
Content-Type: application/json

{
  "type": "success", // or "failure"
  "email": "test@example.com",
  "orderDetails": {
    "orderId": "ORD-TEST-001",
    "customerName": "John Doe",
    "amount": 2500,
    "currency": "BDT"
  }
}
```

### Frontend Testing
You can create a simple test page to send emails:

```jsx
const testEmail = async (type) => {
  const response = await fetch('/api/test-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: type, // 'success' or 'failure'
      email: 'your-test@email.com'
    })
  });
  
  const result = await response.json();
  console.log(result);
};
```

## Integration Points

The email system is automatically triggered at these points:

1. **Payment Success** (`/api/ssl-success`): When SSLCommerz confirms successful payment
2. **Payment Failure** (`/api/ssl-fail`): When payment fails during processing
3. **Payment Cancellation** (`/api/ssl-cancel`): When user cancels payment

## Customization

### Modify Email Templates
Edit the email templates in `/lib/email.ts`:

```typescript
// Success email template
export const generatePaymentSuccessEmail = (orderDetails) => {
  // Customize HTML and text content
}

// Failure email template  
export const generatePaymentFailureEmail = (orderDetails) => {
  // Customize HTML and text content
}
```

### Add Additional Email Types
You can extend the system to send emails for:
- Order shipped notifications
- Delivery confirmations
- Refund notifications
- Account registration welcome emails

## Troubleshooting

### Common Issues

1. **Authentication Failed**
   - Check Gmail app password is correct
   - Ensure 2FA is enabled on Gmail
   - Verify EMAIL_USER and EMAIL_PASS are set correctly

2. **Emails Not Sending**
   - Check email service provider settings
   - Verify SMTP configuration
   - Check server logs for error details

3. **Emails Going to Spam**
   - Add SPF records to your domain
   - Set up DKIM authentication
   - Use a professional "From" address

### Debug Mode
Add console logging to track email sending:

```typescript
console.log('Sending email to:', email);
console.log('Email result:', result);
```

## Production Considerations

1. **Use Professional Email Service**
   - SendGrid, Mailgun, or AWS SES for production
   - Better deliverability and analytics

2. **Email Queue System**
   - Consider using Redis/Bull for email queuing
   - Prevents blocking payment processing

3. **Rate Limiting**
   - Implement rate limiting to prevent abuse
   - Monitor email sending volumes

4. **Error Handling**
   - Email failures shouldn't block payment processing
   - Log all email errors for monitoring

## Security Best Practices

1. **Environment Variables**
   - Never commit email credentials to git
   - Use Vercel/hosting platform environment variables

2. **Email Content**
   - Sanitize user input in email content
   - Use template engines to prevent injection

3. **Email Addresses**
   - Validate email addresses before sending
   - Implement unsubscribe mechanisms

## Monitoring

Track email performance:
- Delivery rates
- Open rates (if using tracking pixels)
- Click-through rates on email buttons
- Error rates and bounce rates

The email notification system is now ready to enhance your customer experience with professional payment notifications! 📧✨