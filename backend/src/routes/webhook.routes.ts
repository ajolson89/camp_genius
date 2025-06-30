import { Router } from 'express';
import Stripe from 'stripe';
import { config } from '../config/env';
import { supabaseAdmin } from '../config/database';
import { AppError } from '../middleware/errorHandler';

const router = Router();
const stripe = new Stripe(config.payment.stripeSecretKey, {
  apiVersion: '2024-12-18.acacia'
});

// Stripe webhook
router.post('/stripe', express.raw({ type: 'application/json' }), async (req, res, next) => {
  try {
    const sig = req.headers['stripe-signature'];
    
    if (!sig || !config.payment.stripeWebhookSecret) {
      throw new AppError(400, 'Missing stripe signature or webhook secret');
    }
    
    let event: Stripe.Event;
    
    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        config.payment.stripeWebhookSecret
      );
    } catch (err: any) {
      throw new AppError(400, `Webhook Error: ${err.message}`);
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
    next(error);
  }
});

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
  
  // Send confirmation email (implement email service)
  // await emailService.sendBookingConfirmation(userId, bookingId);
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

// Fix for express.raw middleware
import express from 'express';

export default router;