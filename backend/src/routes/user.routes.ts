import { Router } from 'express';
import { z } from 'zod';
import { authenticate, AuthRequest } from '../middleware/auth';
import { validateRequest } from '../middleware/validateRequest';
import { supabaseAdmin } from '../config/database';
import { AppError } from '../middleware/errorHandler';

const router = Router();

// Get current user profile
router.get('/me', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('*, pets(*)')
      .eq('id', req.user!.id)
      .single();
    
    if (error || !user) {
      throw new AppError(404, 'User not found');
    }
    
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    next(error);
  }
});

// Update user profile
const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    avatar: z.string().url().optional(),
    preferences: z.object({
      equipmentType: z.enum(['tent', 'rv', 'cabin', 'glamping']).optional(),
      campingStyle: z.array(z.string()).optional(),
      favoriteActivities: z.array(z.string()).optional(),
      dietaryRestrictions: z.array(z.string()).optional(),
      budgetRange: z.object({
        min: z.number(),
        max: z.number()
      }).optional()
    }).optional(),
    accessibilityNeeds: z.object({
      mobility: z.boolean().optional(),
      visual: z.boolean().optional(),
      hearing: z.boolean().optional(),
      cognitive: z.boolean().optional(),
      other: z.array(z.string()).optional()
    }).optional()
  })
});

router.patch('/me', authenticate, validateRequest(updateProfileSchema), async (req: AuthRequest, res, next) => {
  try {
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .update(req.body)
      .eq('id', req.user!.id)
      .select()
      .single();
    
    if (error || !user) {
      throw new AppError(500, 'Failed to update profile');
    }
    
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    next(error);
  }
});

// Get saved campsites
router.get('/me/saved-campsites', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('saved_campsites')
      .eq('id', req.user!.id)
      .single();
    
    if (userError || !user) {
      throw new AppError(404, 'User not found');
    }
    
    if (!user.saved_campsites || user.saved_campsites.length === 0) {
      return res.json([]);
    }
    
    const { data: campsites, error: campsitesError } = await supabaseAdmin
      .from('campsites')
      .select('*')
      .in('id', user.saved_campsites);
    
    if (campsitesError) {
      throw new AppError(500, 'Failed to fetch saved campsites');
    }
    
    res.json(campsites || []);
  } catch (error) {
    next(error);
  }
});

// Save/unsave campsite
router.post('/me/saved-campsites/:campsiteId', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { campsiteId } = req.params;
    
    // Verify campsite exists
    const { data: campsite, error: campsiteError } = await supabaseAdmin
      .from('campsites')
      .select('id')
      .eq('id', campsiteId)
      .single();
    
    if (campsiteError || !campsite) {
      throw new AppError(404, 'Campsite not found');
    }
    
    // Get current saved campsites
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('saved_campsites')
      .eq('id', req.user!.id)
      .single();
    
    if (userError || !user) {
      throw new AppError(404, 'User not found');
    }
    
    const savedCampsites = user.saved_campsites || [];
    const isAlreadySaved = savedCampsites.includes(campsiteId);
    
    let updatedSavedCampsites;
    if (isAlreadySaved) {
      // Remove from saved
      updatedSavedCampsites = savedCampsites.filter(id => id !== campsiteId);
    } else {
      // Add to saved
      updatedSavedCampsites = [...savedCampsites, campsiteId];
    }
    
    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({ saved_campsites: updatedSavedCampsites })
      .eq('id', req.user!.id);
    
    if (updateError) {
      throw new AppError(500, 'Failed to update saved campsites');
    }
    
    res.json({ 
      saved: !isAlreadySaved,
      savedCampsites: updatedSavedCampsites
    });
  } catch (error) {
    next(error);
  }
});

// Pet management routes
const petSchema = z.object({
  body: z.object({
    name: z.string().min(1),
    type: z.enum(['dog', 'cat', 'other']),
    breed: z.string().optional(),
    size: z.enum(['small', 'medium', 'large']),
    specialNeeds: z.string().optional()
  })
});

router.get('/me/pets', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { data: pets, error } = await supabaseAdmin
      .from('pets')
      .select('*')
      .eq('user_id', req.user!.id);
    
    if (error) {
      throw new AppError(500, 'Failed to fetch pets');
    }
    
    res.json(pets || []);
  } catch (error) {
    next(error);
  }
});

router.post('/me/pets', authenticate, validateRequest(petSchema), async (req: AuthRequest, res, next) => {
  try {
    const { data: pet, error } = await supabaseAdmin
      .from('pets')
      .insert({
        ...req.body,
        user_id: req.user!.id
      })
      .select()
      .single();
    
    if (error || !pet) {
      throw new AppError(500, 'Failed to add pet');
    }
    
    res.status(201).json(pet);
  } catch (error) {
    next(error);
  }
});

router.delete('/me/pets/:petId', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { error } = await supabaseAdmin
      .from('pets')
      .delete()
      .eq('id', req.params.petId)
      .eq('user_id', req.user!.id);
    
    if (error) {
      throw new AppError(500, 'Failed to delete pet');
    }
    
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;