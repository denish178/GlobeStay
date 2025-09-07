# Payment System Setup Guide

## Overview

The GlobeStay project now includes a comprehensive payment system with support for multiple payment methods:

- Credit/Debit Cards (via Stripe)
- UPI (Unified Payments Interface)
- Net Banking
- Digital Wallets

## Prerequisites

1. Node.js and npm installed
2. MongoDB running locally
3. Stripe account (for card payments)

## Installation

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

Create a `.env` file in the root directory with the following variables:

```env
# Database Configuration
MONGO_URL=mongodb://127.0.0.1:27017/Wanderlust

# Session Configuration
SESSION_SECRET=your_session_secret_here

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here

# Server Configuration
PORT=8080
NODE_ENV=development
```

### 3. Stripe Setup

1. Create a Stripe account at https://stripe.com
2. Get your test API keys from the Stripe Dashboard
3. Update the `.env` file with your Stripe keys

## Payment Flow

### 1. Booking Creation

- User creates a booking with check-in/check-out dates
- System calculates total price based on nights
- User is redirected to payment page

### 2. Payment Selection

- User chooses payment method (Card, UPI, Net Banking, Wallet)
- Different forms are displayed based on selection

### 3. Payment Processing

- **Card Payments**: Processed via Stripe
- **UPI**: Simulated payment processing
- **Net Banking**: Simulated bank selection
- **Digital Wallets**: Simulated wallet payment

### 4. Payment Confirmation

- Payment status is updated in database
- Booking status is confirmed
- User receives confirmation

## API Endpoints

### Payment Routes

- `POST /payments/create-intent` - Create Stripe payment intent
- `POST /payments/process` - Process payment completion
- `GET /payments/status/:paymentId` - Get payment status
- `POST /payments/upi` - Process UPI payment
- `GET /payments/history` - Get user payment history

### Booking Routes

- `GET /bookings/:bookingId/payment` - Show payment page
- `GET /bookings/payment/success` - Show payment success page

## Database Models

### Payment Model

```javascript
{
  booking: ObjectId,
  amount: Number,
  currency: String,
  paymentMethod: String,
  paymentStatus: String,
  transactionId: String,
  stripePaymentIntentId: String,
  paymentDetails: Object,
  metadata: Object,
  createdAt: Date,
  updatedAt: Date
}
```

### Booking Model (Updated)

```javascript
{
  // ... existing fields
  paymentStatus: String, // 'pending', 'paid', 'refunded'
  status: String // 'pending', 'confirmed', 'cancelled', 'completed'
}
```

## Testing

### Test Card Numbers (Stripe Test Mode)

- Visa: 4242424242424242
- Mastercard: 5555555555554444
- American Express: 378282246310005

### Test UPI IDs

- Any valid UPI format: username@upi

## Security Features

- Environment variables for sensitive data
- Stripe secure payment processing
- Input validation and sanitization
- CSRF protection
- Session-based authentication

## Customization

### Adding New Payment Methods

1. Update the Payment model enum
2. Add payment method to the payment form
3. Create corresponding controller function
4. Add validation schema

### Styling

- Payment styles are in `public/css/style.css`
- Responsive design for mobile devices
- Custom animations and transitions

## Troubleshooting

### Common Issues

1. **Stripe Keys Not Working**: Ensure you're using test keys for development
2. **Payment Not Processing**: Check browser console for JavaScript errors
3. **Database Connection**: Verify MongoDB is running
4. **Environment Variables**: Ensure `.env` file is in root directory

### Debug Mode

Set `NODE_ENV=development` in your `.env` file for detailed error messages.

## Production Deployment

1. Use production Stripe keys
2. Set secure session secret
3. Enable HTTPS
4. Configure proper CORS settings
5. Set up monitoring and logging

## Support

For issues related to:

- Stripe integration: Check Stripe documentation
- Payment processing: Review server logs
- UI/UX: Check browser console for errors
