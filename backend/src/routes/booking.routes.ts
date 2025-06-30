import { Router } from 'express';
import { z } from 'zod';
import Stripe from 'stripe';
import { authenticate, AuthRequest } from '../middleware/auth';
import { validateRequest } from '../middleware/validateRequest';
import { supabaseAdmin } from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { config } from '../config/env';

const router = Router();
const stripe = new Stripe(config.payment.stripeSecretKey, {
  apiVersion: '2024-12-18.acacia'
});

// Create booking schema
const createBookingSchema = z.object({
  body: z.object({
    campsiteId: z.string().uuid(),
    checkInDate: z.string(),
    checkOutDate: z.string(),
    numberOfGuests: z.number().min(1),
    equipmentType: z.enum(['tent', 'rv', 'cabin', 'glamping']),
    contactInfo: z.object({
      firstName: z.string().min(1),
      lastName: z.string().min(1),
      email: z.string().email(),
      phone: z.string().min(10)
    }),
    specialRequests: z.string().optional()
  })
});

// Get user's bookings
router.get('/', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { status, page = '1', limit = '10' } = req.query;
    
    let query = supabaseAdmin
      .from('bookings')
      .select('*, campsites(*)', { count: 'exact' })
      .eq('user_id', req.user!.id)
      .order('created_at', { ascending: false });
    
    if (status) {
      query = query.eq('status', status);
    }
    
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;
    
    query = query.range(offset, offset + limitNum - 1);
    
    const { data: bookings, error, count } = await query;
    
    if (error) {
      throw new AppError(500, 'Failed to fetch bookings');
    }
    
    res.json({
      bookings: bookings || [],
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limitNum)
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get single booking
router.get('/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;
    
    const { data: booking, error } = await supabaseAdmin
      .from('bookings')
      .select('*, campsites(*)')
      .eq('id', id)
      .eq('user_id', req.user!.id)
      .single();
    
    if (error || !booking) {
      throw new AppError(404, 'Booking not found');
    }
    
    res.json(booking);
  } catch (error) {
    next(error);
  }
});

// Create booking
router.post('/', authenticate, validateRequest(createBookingSchema), async (req: AuthRequest, res, next) => {
  try {
    const {
      campsiteId,
      checkInDate,
      checkOutDate,
      numberOfGuests,
      equipmentType,
      contactInfo,
      specialRequests
    } = req.body;
    
    // Verify campsite exists
    const { data: campsite, error: campsiteError } = await supabaseAdmin
      .from('campsites')
      .select('*')
      .eq('id', campsiteId)
      .single();
    
    if (campsiteError || !campsite) {
      throw new AppError(404, 'Campsite not found');
    }
    
    // Check availability
    const { data: availability, error: availabilityError } = await supabaseAdmin
      .from('availability')
      .select('*')
      .eq('campsite_id', campsiteId)
      .gte('date', checkInDate)
      .lte('date', checkOutDate);
    
    if (availabilityError) {
      throw new AppError(500, 'Failed to check availability');
    }
    
    // Verify all dates are available for the equipment type
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
    
    if (availability && availability.length < nights) {
      throw new AppError(400, 'Some dates are not available');
    }
    
    const isAvailable = availability?.every(day => day[equipmentType] === true);
    if (!isAvailable) {
      throw new AppError(400, 'Campsite is not available for the selected dates and equipment type');
    }
    
    // Calculate total price
    const pricePerNight = campsite.pricing[equipmentType];
    const totalPrice = pricePerNight * nights;
    
    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalPrice * 100), // Convert to cents
      currency: 'usd',
      metadata: {
        userId: req.user!.id,
        campsiteId,
        checkInDate,
        checkOutDate
      }
    });
    
    // Create booking
    const { data: booking, error: bookingError } = await supabaseAdmin
      .from('bookings')
      .insert({
        user_id: req.user!.id,
        campsite_id: campsiteId,
        check_in_date: checkInDate,
        check_out_date: checkOutDate,
        number_of_guests: numberOfGuests,
        equipment_type: equipmentType,
        total_price: totalPrice,
        status: 'pending',
        contact_info: contactInfo,
        special_requests: specialRequests,
        stripe_payment_intent_id: paymentIntent.id
      })
      .select()
      .single();
    
    if (bookingError || !booking) {
      // Cancel payment intent if booking creation fails
      await stripe.paymentIntents.cancel(paymentIntent.id);
      throw new AppError(500, 'Failed to create booking');
    }
    
    res.status(201).json({
      booking,
      paymentIntent: {
        clientSecret: paymentIntent.client_secret,
        amount: paymentIntent.amount
      }
    });
  } catch (error) {
    next(error);
  }
});

// Cancel booking
router.post('/:id/cancel', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;
    
    // Get booking
    const { data: booking, error: fetchError } = await supabaseAdmin
      .from('bookings')
      .select('*')
      .eq('id', id)
      .eq('user_id', req.user!.id)
      .single();
    
    if (fetchError || !booking) {
      throw new AppError(404, 'Booking not found');
    }
    
    if (booking.status !== 'confirmed') {
      throw new AppError(400, 'Only confirmed bookings can be cancelled');
    }
    
    // Check cancellation policy (24 hours before check-in)
    const checkInDate = new Date(booking.check_in_date);
    const now = new Date();
    const hoursUntilCheckIn = (checkInDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    if (hoursUntilCheckIn < 24) {
      throw new AppError(400, 'Bookings cannot be cancelled within 24 hours of check-in');
    }
    
    // Process refund if payment was made
    if (booking.stripe_payment_intent_id) {
      const paymentIntent = await stripe.paymentIntents.retrieve(booking.stripe_payment_intent_id);
      
      if (paymentIntent.status === 'succeeded') {
        await stripe.refunds.create({
          payment_intent: booking.stripe_payment_intent_id,
          reason: 'requested_by_customer'
        });
      }
    }
    
    // Update booking status
    const { data: updatedBooking, error: updateError } = await supabaseAdmin
      .from('bookings')
      .update({ status: 'cancelled' })
      .eq('id', id)
      .select()
      .single();
    
    if (updateError || !updatedBooking) {
      throw new AppError(500, 'Failed to cancel booking');
    }
    
    res.json(updatedBooking);
  } catch (error) {
    next(error);
  }
});

export default router;