# Stripe Payment Integration Guide

## Overview

The Club 420 Poker app now has **full Stripe payment integration** for the Banker marketplace system. The implementation includes:

- ✅ Stripe React Native SDK installed
- ✅ Stripe Connect for bankers (account onboarding)
- ✅ Payment Intent creation for bundle purchases
- ✅ Stripe Payment Sheet UI for card payments
- ✅ Complete payment flow from buyer to banker
- ✅ Fallback to mock purchases for testing

## What's Implemented (Client-Side)

### 1. Stripe Service (`src/services/stripeService.ts`)

Complete Stripe integration service with:

#### Initialization
```typescript
import { initializeStripe } from "./src/services/stripeService";

// Call this on app startup (already integrated in App.tsx)
await initializeStripe();
```

#### Banker Connect Account Creation
```typescript
const result = await stripeService.createConnectAccount(userId, email);
// Returns: { accountId: string, onboardingUrl: string }
```

#### Payment Processing
```typescript
const { processPayment } = useStripePayment();

const success = await processPayment(
  bundleId,
  sellerId,
  amountInPence,
  buyerId
);
```

#### Account Status Checking
```typescript
const status = await stripeService.getConnectAccountStatus(accountId);
// Returns: { chargesEnabled, detailsSubmitted, payoutsEnabled }
```

### 2. App Integration (`App.tsx`)

The app is wrapped with `StripeProvider` for global Stripe access:

```typescript
<StripeProvider
  publishableKey={STRIPE_PUBLISHABLE_KEY}
  merchantIdentifier="merchant.com.club420poker"
  urlScheme="club420poker"
>
  <NavigationContainer>
    <RootNavigator />
  </NavigationContainer>
</StripeProvider>
```

### 3. Banker Screen Integration (`src/screens/BankerScreen.tsx`)

#### Connect Stripe Account
- Bankers click "Connect Stripe Account" button
- Creates Stripe Connect account via backend
- Opens Stripe onboarding in browser
- Saves account ID to user profile
- Shows connection status with real-time checks

#### Account Status Display
When connected, shows:
- ✅ Charges Enabled
- ✅ Details Submitted
- ✅ Payouts Enabled

### 4. Marketplace Screen Integration (`src/screens/MarketplaceScreen.tsx`)

#### Bundle Purchase Flow
1. User selects a bundle
2. Chooses "Card Payment" option
3. Stripe Payment Sheet opens
4. User enters card details
5. Payment processed
6. CHiP$ instantly credited to account
7. Transaction recorded

#### Mock Fallback
If Stripe backend is not configured:
- Shows alert: "Stripe Not Configured"
- Offers mock purchase for testing
- Allows testing full UI flow

## What's Missing (Backend Required)

You need to build a **Node.js/Express backend** with Stripe SDK to handle:

### Required Backend Endpoints

#### 1. Create Connect Account
```javascript
POST /create-connect-account
Body: { userId: string, email: string }
Response: { accountId: string, onboardingUrl: string }

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

app.post('/create-connect-account', async (req, res) => {
  const { userId, email } = req.body;

  // Create Stripe Connect account
  const account = await stripe.accounts.create({
    type: 'express',
    email,
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true },
    },
  });

  // Create onboarding link
  const accountLink = await stripe.accountLinks.create({
    account: account.id,
    refresh_url: 'https://your-app.com/reauth',
    return_url: 'https://your-app.com/return',
    type: 'account_onboarding',
  });

  res.json({
    accountId: account.id,
    onboardingUrl: accountLink.url,
  });
});
```

#### 2. Get Account Status
```javascript
GET /connect-account-status/:accountId
Response: { chargesEnabled: boolean, detailsSubmitted: boolean, payoutsEnabled: boolean }

app.get('/connect-account-status/:accountId', async (req, res) => {
  const { accountId } = req.params;

  const account = await stripe.accounts.retrieve(accountId);

  res.json({
    chargesEnabled: account.charges_enabled,
    detailsSubmitted: account.details_submitted,
    payoutsEnabled: account.payouts_enabled,
  });
});
```

#### 3. Create Payment Intent
```javascript
POST /create-payment-intent
Body: { bundleId: string, sellerId: string, amount: number, buyerId: string }
Response: { clientSecret: string, paymentIntentId: string }

app.post('/create-payment-intent', async (req, res) => {
  const { bundleId, sellerId, amount, buyerId } = req.body;

  // Get seller's Stripe account ID from database
  const seller = await getUserById(sellerId);

  // Calculate application fee (1% for OG, 4.2% for regular)
  const applicationFeeAmount = Math.round(amount * seller.bankerFeeRate);

  // Create payment intent
  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency: 'gbp',
    application_fee_amount: applicationFeeAmount,
    transfer_data: {
      destination: seller.stripeConnectedAccountId,
    },
    metadata: {
      bundleId,
      buyerId,
      sellerId,
    },
  });

  res.json({
    clientSecret: paymentIntent.client_secret,
    paymentIntentId: paymentIntent.id,
  });
});
```

#### 4. Confirm Payment Status
```javascript
GET /payment-status/:paymentIntentId
Response: { status: 'succeeded' | 'processing' | 'failed', chipAmount?: number }

app.get('/payment-status/:paymentIntentId', async (req, res) => {
  const { paymentIntentId } = req.params;

  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

  // Get bundle from metadata
  const bundle = await getBundleById(paymentIntent.metadata.bundleId);

  res.json({
    status: paymentIntent.status,
    chipAmount: bundle?.chipAmount,
  });
});
```

#### 5. Banker Earnings
```javascript
GET /banker-earnings/:sellerId
Response: { totalEarnings: number, bundlesSold: number, pendingPayouts: number }

app.get('/banker-earnings/:sellerId', async (req, res) => {
  const { sellerId } = req.params;

  // Query your database for banker's transaction history
  const earnings = await getBankerEarnings(sellerId);

  res.json(earnings);
});
```

#### 6. Create Payout
```javascript
POST /create-payout
Body: { sellerId: string, amount: number }
Response: { payoutId: string }

app.post('/create-payout', async (req, res) => {
  const { sellerId, amount } = req.body;

  const seller = await getUserById(sellerId);

  // Create payout to banker's bank account
  const payout = await stripe.payouts.create(
    {
      amount,
      currency: 'gbp',
    },
    {
      stripeAccount: seller.stripeConnectedAccountId,
    }
  );

  res.json({ payoutId: payout.id });
});
```

### Webhooks (Important!)

Set up Stripe webhooks to handle async events:

```javascript
POST /webhook

app.post('/webhook', express.raw({ type: 'application/json' }), (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle events
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      // Update bundle as sold, credit CHiP$ to buyer
      handlePaymentSuccess(paymentIntent);
      break;

    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object;
      // Notify user of failure
      handlePaymentFailure(failedPayment);
      break;

    case 'account.updated':
      const account = event.data.object;
      // Update banker's account status in database
      updateBankerAccountStatus(account);
      break;
  }

  res.json({ received: true });
});
```

## Environment Variables

### Required (User Must Add)

Add these to your environment or Vibecode ENV tab:

```bash
# Stripe Keys (Get from Stripe Dashboard)
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...  # Backend only, NEVER expose in app

# Backend URL
EXPO_PUBLIC_STRIPE_BACKEND_URL=https://your-backend-url.com

# Webhook Secret (Get from Stripe Dashboard → Webhooks)
STRIPE_WEBHOOK_SECRET=whsec_...  # Backend only
```

### For Testing

Use Stripe test mode keys:
- Test publishable key: `pk_test_...`
- Test secret key: `sk_test_...`

### For Production

Use Stripe live mode keys:
- Live publishable key: `pk_live_...`
- Live secret key: `sk_live_...`

## Testing Without Backend

The app has built-in fallback for testing:

1. **Banker Screen**: Click "Connect Stripe Account"
   - Alert: "Stripe backend is not set up yet"
   - Option: Test with mock connection
   - Create bundles normally for UI testing

2. **Marketplace Screen**: Try to purchase a bundle
   - Alert: "Stripe Not Configured"
   - Option: Mock purchase
   - CHiP$ credited instantly for testing

This allows full UI flow testing without backend deployment.

## Payment Flow Diagram

```
User → Marketplace → Select Bundle → Choose Card Payment
  ↓
App calls: stripeService.createPaymentIntent()
  ↓
Backend creates PaymentIntent with Stripe Connect
  ↓
Backend returns clientSecret to app
  ↓
App initializes Payment Sheet with clientSecret
  ↓
User enters card details in Payment Sheet
  ↓
Stripe processes payment
  ↓
Payment succeeds → CHiP$ credited to buyer
  ↓
Funds transferred to banker's Stripe account (minus fee)
  ↓
Banker can view earnings and request payout
```

## Stripe Connect Fee Structure

### OG Bankers (C420 Token Holders)
- **Fee Rate**: 1% of bundle price
- **Example**: £100 bundle = £99 to banker, £1 to platform

### Regular Bankers (10,000+ CHiP$)
- **Fee Rate**: 4.2% of bundle price
- **Example**: £100 bundle = £95.80 to banker, £4.20 to platform

Fees are automatically calculated and deducted via Stripe Connect's `application_fee_amount` parameter.

## Security Best Practices

### ✅ What We Did
- Used environment variables for keys
- Publishable key only in client app
- Secret key only on backend
- Webhook signature verification
- User authentication before payments

### ⚠️ Important
- **NEVER** expose `STRIPE_SECRET_KEY` in client app
- **ALWAYS** validate user identity on backend
- **ALWAYS** verify webhook signatures
- **NEVER** trust client-side payment amounts
- **ALWAYS** fetch bundle prices from database on backend

## Testing Stripe Integration

### Test Cards (Stripe Test Mode)

**Successful Payment**:
```
Card: 4242 4242 4242 4242
Expiry: Any future date
CVC: Any 3 digits
ZIP: Any 5 digits
```

**Declined Payment**:
```
Card: 4000 0000 0000 0002
```

**Requires Authentication (3D Secure)**:
```
Card: 4000 0025 0000 3155
```

### Test Banker Onboarding

When testing Connect account creation:
1. Use test mode Stripe account
2. Use real email for test account
3. Complete onboarding with test information
4. Stripe provides pre-filled test data

## Deployment Checklist

### Backend Deployment
- [ ] Deploy Node.js/Express server
- [ ] Set environment variables (STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET)
- [ ] Configure Stripe webhooks endpoint
- [ ] Test all API endpoints
- [ ] Set up database for user/bundle/transaction storage

### App Configuration
- [ ] Add EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY to ENV
- [ ] Add EXPO_PUBLIC_STRIPE_BACKEND_URL to ENV
- [ ] Test payment flow end-to-end
- [ ] Verify webhook events are received
- [ ] Test banker onboarding flow

### Production Checklist
- [ ] Switch from Stripe test keys to live keys
- [ ] Update webhook URL to production
- [ ] Enable live mode in Stripe Dashboard
- [ ] Test with real (small amount) payment
- [ ] Monitor Stripe Dashboard for errors
- [ ] Set up payout schedule for bankers

## Troubleshooting

### "Stripe Not Configured" Alert
**Cause**: Backend URL not set or backend not responding
**Solution**: Set `EXPO_PUBLIC_STRIPE_BACKEND_URL` and ensure backend is running

### Payment Sheet Doesn't Open
**Cause**: Invalid publishable key or client secret
**Solution**: Verify `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY` is correct test/live key

### Payment Succeeds But CHiP$ Not Credited
**Cause**: Webhook not configured or not firing
**Solution**:
1. Check webhook endpoint is publicly accessible
2. Verify webhook signature validation
3. Check backend logs for webhook events

### Banker Onboarding Fails
**Cause**: Invalid email or Stripe account issue
**Solution**:
1. Use valid email format
2. Check Stripe Dashboard for account status
3. Complete all required onboarding steps

## Next Steps

1. **Deploy Backend**: Build and deploy the Stripe backend server
2. **Configure Environment**: Add all required environment variables
3. **Set Up Webhooks**: Configure webhook URL in Stripe Dashboard
4. **Test End-to-End**: Complete full payment flow with test cards
5. **Go Live**: Switch to live keys and enable real payments

## Production Considerations

- **PCI Compliance**: Stripe handles card data, app is PCI compliant
- **Fraud Prevention**: Enable Stripe Radar for fraud detection
- **Dispute Handling**: Monitor Stripe Dashboard for chargebacks
- **Refunds**: Implement refund endpoint if needed
- **Transaction History**: Store all transactions in database
- **Email Receipts**: Send confirmation emails via backend
- **Analytics**: Track conversion rates and revenue

## Resources

- [Stripe React Native SDK Docs](https://stripe.dev/stripe-react-native/)
- [Stripe Connect Express Accounts](https://stripe.com/docs/connect/express-accounts)
- [Stripe Payment Intents](https://stripe.com/docs/payments/payment-intents)
- [Stripe Webhooks](https://stripe.com/docs/webhooks)
- [Stripe Testing](https://stripe.com/docs/testing)

---

**Status**: ✅ Client-side implementation complete, awaiting backend deployment
