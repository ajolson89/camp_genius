import { Router } from 'express';
import { z } from 'zod';
import { authenticate, AuthRequest } from '../middleware/auth';
import { validateRequest } from '../middleware/validateRequest';
import { AISearchService } from '../services/ai-search.service';
import { AIAssistantService } from '../services/ai-assistant.service';
import { AppError } from '../middleware/errorHandler';

const router = Router();

const aiSearchService = new AISearchService();
const aiAssistantService = new AIAssistantService();

// AI-powered campsite search
const searchSchema = z.object({
  body: z.object({
    query: z.string().min(1),
    filters: z.object({
      location: z.string().optional(),
      checkInDate: z.string().optional(),
      checkOutDate: z.string().optional(),
      numberOfGuests: z.number().optional(),
      equipmentType: z.enum(['tent', 'rv', 'cabin', 'glamping']).optional(),
      priceRange: z.object({
        min: z.number(),
        max: z.number()
      }).optional(),
      amenities: z.array(z.string()).optional(),
      accessibilityNeeds: z.object({
        mobility: z.boolean().optional(),
        visual: z.boolean().optional(),
        hearing: z.boolean().optional(),
        cognitive: z.boolean().optional()
      }).optional(),
      petFriendly: z.boolean().optional()
    }).optional(),
    maxResults: z.number().min(1).max(50).default(20)
  })
});

router.post('/search', authenticate, validateRequest(searchSchema), async (req: AuthRequest, res, next) => {
  try {
    const { query, filters, maxResults } = req.body;
    
    const results = await aiSearchService.searchCampsites({
      naturalLanguageQuery: query,
      userId: req.user!.id,
      filters,
      includeRecommendations: true,
      maxResults
    });
    
    res.json(results);
  } catch (error) {
    next(error);
  }
});

// AI chat assistant
const chatSchema = z.object({
  body: z.object({
    message: z.string().min(1),
    context: z.object({
      currentPage: z.string().optional(),
      selectedCampsite: z.string().optional(),
      tripId: z.string().optional()
    }).optional()
  })
});

router.post('/chat', authenticate, validateRequest(chatSchema), async (req: AuthRequest, res, next) => {
  try {
    const { message, context } = req.body;
    
    const response = await aiAssistantService.processMessage({
      userId: req.user!.id,
      message,
      context
    });
    
    res.json(response);
  } catch (error) {
    next(error);
  }
});

// Get chat history
router.get('/chat/history', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { limit = '20', offset = '0' } = req.query;
    
    const history = await aiAssistantService.getChatHistory(
      req.user!.id,
      parseInt(limit as string),
      parseInt(offset as string)
    );
    
    res.json(history);
  } catch (error) {
    next(error);
  }
});

// Get AI recommendations for a specific campsite
router.get('/recommendations/campsite/:campsiteId', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { campsiteId } = req.params;
    
    const recommendation = await aiSearchService.getRecommendationForCampsite(
      req.user!.id,
      campsiteId
    );
    
    res.json(recommendation);
  } catch (error) {
    next(error);
  }
});

// Get personalized campsite recommendations
router.get('/recommendations', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { limit = '10' } = req.query;
    
    const recommendations = await aiSearchService.getPersonalizedRecommendations(
      req.user!.id,
      parseInt(limit as string)
    );
    
    res.json(recommendations);
  } catch (error) {
    next(error);
  }
});

export default router;