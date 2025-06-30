import { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { config } from '../../src/config/env';
import { supabaseAdmin } from '../../src/config/database';

const stripe = new Stripe(config.payment.stripeSecretKey, {
  apiVersion: '2024-12-18.acacia'
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const sig = req.headers['stripe-signature'] as string;
    
    if (!sig || !config.payment.stripeWebhookSecret) {
      return res.status(400).json({ error: 'Missing stripe signature or webhook secret' });
    }
    
    let event: Stripe.Event;
    
    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        config.payment.stripeWebhookSecret
      );
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return res.status(400).json({ error: `Webhook Error: ${err.message}` });
    }
    
    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSuccess(event.data.object as Stripe.PaymentIntent);
        break;
        
      case 'payment_intent.payment_failed':
        await handlePaymentFailure(event.data.object as Stripe.PaymentIntent);
        break;
        
      default:
        console.log(`Unhandled event type ${event.type}`);
    }
    
    res.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
}

async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
  const { userId, campsiteId, checkInDate, checkOutDate } = paymentIntent.metadata;
  
  // Update booking status
  const { error: updateError } = await supabaseAdmin
    .from('bookings')
    .update({ status: 'confirmed' })
    .eq('stripe_payment_intent_id', paymentIntent.id);
  
  if (updateError) {
    console.error('Failed to update booking status:', updateError);
    return;
  }
  
  // Update availability
  const checkIn = new Date(checkInDate);
  const checkOut = new Date(checkOutDate);
  const dates = [];
  
  for (let d = new Date(checkIn); d < checkOut; d.setDate(d.getDate() + 1)) {
    dates.push(new Date(d).toISOString().split('T')[0]);
  }
  
  // Mark dates as unavailable
  for (const date of dates) {
    await supabaseAdmin
      .from('availability')
      .update({ tent: false, rv: false, cabin: false, glamping: false })
      .eq('campsite_id', campsiteId)
      .eq('date', date);
  }
}

async function handlePaymentFailure(paymentIntent: Stripe.PaymentIntent) {
  // Update booking status
  const { error } = await supabaseAdmin
    .from('bookings')
    .update({ status: 'cancelled' })
    .eq('stripe_payment_intent_id', paymentIntent.id);
  
  if (error) {
    console.error('Failed to update booking status:', error);
  }
}