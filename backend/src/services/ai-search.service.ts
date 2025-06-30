import { OpenAI } from 'openai';
import { Pinecone } from '@pinecone-database/pinecone';
import { config } from '../config/env';
import { supabaseAdmin } from '../config/database';
import { AISearchQuery, Campsite, SearchFilters, AIRecommendation } from '../types';
import { AppError } from '../middleware/errorHandler';

export class AISearchService {
  private openai: OpenAI;
  private pinecone: Pinecone;
  private pineconeIndex: any;

  constructor() {
    this.openai = new OpenAI({
      apiKey: config.ai.openaiApiKey
    });

    this.pinecone = new Pinecone({
      apiKey: config.ai.pineconeApiKey,
      environment: config.ai.pineconeEnvironment
    });

    this.initializePinecone();
  }

  private async initializePinecone() {
    try {
      this.pineconeIndex = await this.pinecone.index(config.ai.pineconeIndexName);
    } catch (error) {
      console.error('Failed to initialize Pinecone:', error);
    }
  }

  async searchCampsites(query: AISearchQuery) {
    try {
      // Extract structured data from natural language query
      const structuredQuery = await this.parseNaturalLanguageQuery(query.naturalLanguageQuery);
      
      // Merge with provided filters
      const filters = {
        ...structuredQuery.filters,
        ...query.filters
      };

      // Generate embedding for semantic search
      const embedding = await this.generateEmbedding(query.naturalLanguageQuery);

      // Search in Pinecone
      const vectorResults = await this.searchVectorDatabase(embedding, filters, query.maxResults || 20);

      // Get full campsite details from Supabase
      const campsiteIds = vectorResults.map(r => r.id);
      const { data: campsites, error } = await supabaseAdmin
        .from('campsites')
        .select('*')
        .in('id', campsiteIds);

      if (error) {
        throw new AppError(500, 'Failed to fetch campsite details');
      }

      // Generate AI recommendations if requested
      let campsitesWithRecommendations = campsites || [];
      if (query.includeRecommendations && query.userId) {
        campsitesWithRecommendations = await this.addRecommendations(
          campsites || [],
          query.userId
        );
      }

      // Sort by relevance score
      const sortedCampsites = this.sortByRelevance(
        campsitesWithRecommendations,
        vectorResults
      );

      return {
        campsites: sortedCampsites,
        query: structuredQuery,
        totalResults: sortedCampsites.length
      };
    } catch (error) {
      console.error('AI search error:', error);
      throw new AppError(500, 'Failed to perform AI search');
    }
  }

  private async parseNaturalLanguageQuery(query: string) {
    const systemPrompt = `You are a camping expert AI. Parse the user's natural language query and extract structured search filters.
    
    Extract the following information if present:
    - Location (city, state, park name, or general area)
    - Check-in and check-out dates
    - Number of guests
    - Equipment type (tent, RV, cabin, glamping)
    - Price range
    - Amenities needed
    - Accessibility requirements
    - Pet-friendly requirement
    
    Return a JSON object with the extracted filters.`;

    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: query }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3
    });

    const result = JSON.parse(completion.choices[0].message.content || '{}');
    
    return {
      originalQuery: query,
      filters: this.transformToSearchFilters(result)
    };
  }

  private transformToSearchFilters(aiExtracted: any): Partial<SearchFilters> {
    const filters: Partial<SearchFilters> = {};

    if (aiExtracted.location) filters.location = aiExtracted.location;
    if (aiExtracted.checkInDate) filters.checkInDate = aiExtracted.checkInDate;
    if (aiExtracted.checkOutDate) filters.checkOutDate = aiExtracted.checkOutDate;
    if (aiExtracted.numberOfGuests) filters.numberOfGuests = aiExtracted.numberOfGuests;
    if (aiExtracted.equipmentType) filters.equipmentType = aiExtracted.equipmentType;
    if (aiExtracted.priceRange) filters.priceRange = aiExtracted.priceRange;
    if (aiExtracted.amenities) filters.amenities = aiExtracted.amenities;
    if (aiExtracted.petFriendly !== undefined) filters.petFriendly = aiExtracted.petFriendly;
    
    if (aiExtracted.accessibilityRequirements) {
      filters.accessibilityNeeds = {
        mobility: aiExtracted.accessibilityRequirements.mobility || false,
        visual: aiExtracted.accessibilityRequirements.visual || false,
        hearing: aiExtracted.accessibilityRequirements.hearing || false,
        cognitive: aiExtracted.accessibilityRequirements.cognitive || false
      };
    }

    return filters;
  }

  private async generateEmbedding(text: string): Promise<number[]> {
    const response = await this.openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text
    });

    return response.data[0].embedding;
  }

  private async searchVectorDatabase(
    embedding: number[],
    filters: Partial<SearchFilters>,
    topK: number
  ) {
    if (!this.pineconeIndex) {
      throw new AppError(503, 'Vector database not initialized');
    }

    // Build Pinecone filter
    const pineconeFilter: any = {};
    
    if (filters.priceRange) {
      pineconeFilter.price = {
        $gte: filters.priceRange.min,
        $lte: filters.priceRange.max
      };
    }
    
    if (filters.petFriendly) {
      pineconeFilter.petFriendly = true;
    }

    const queryResponse = await this.pineconeIndex.query({
      vector: embedding,
      topK,
      includeMetadata: true,
      filter: Object.keys(pineconeFilter).length > 0 ? pineconeFilter : undefined
    });

    return queryResponse.matches || [];
  }

  private async addRecommendations(campsites: Campsite[], userId: string) {
    // Get user preferences
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('preferences, accessibility_needs')
      .eq('id', userId)
      .single();

    if (!user) return campsites;

    // Generate recommendations for each campsite
    const campsitesWithRecommendations = await Promise.all(
      campsites.map(async (campsite) => {
        const recommendation = await this.generateRecommendation(
          campsite,
          user.preferences,
          user.accessibility_needs
        );

        return {
          ...campsite,
          aiRecommendation: recommendation
        };
      })
    );

    return campsitesWithRecommendations;
  }

  private async generateRecommendation(
    campsite: Campsite,
    userPreferences: any,
    accessibilityNeeds: any
  ): Promise<AIRecommendation> {
    const prompt = `Based on the following user preferences and campsite details, generate a recommendation score (0-1) and reasons why this campsite is a good match.

User Preferences:
${JSON.stringify(userPreferences, null, 2)}

Accessibility Needs:
${JSON.stringify(accessibilityNeeds, null, 2)}

Campsite:
${JSON.stringify({
  name: campsite.name,
  amenities: campsite.amenities,
  accessibility: campsite.accessibility,
  pricing: campsite.pricing,
  policies: campsite.policies
}, null, 2)}

Return a JSON object with:
- score (0-1)
- reasons (array of strings)
- matchPercentage (0-100)
- suggestedActivities (array of strings)`;

    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: 'You are a camping recommendation expert.' },
        { role: 'user', content: prompt }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.5
    });

    const recommendation = JSON.parse(completion.choices[0].message.content || '{}');
    
    return {
      score: recommendation.score || 0,
      reasons: recommendation.reasons || [],
      matchPercentage: recommendation.matchPercentage || 0,
      suggestedActivities: recommendation.suggestedActivities || []
    };
  }

  private sortByRelevance(campsites: any[], vectorResults: any[]) {
    const scoreMap = new Map(
      vectorResults.map(r => [r.id, r.score])
    );

    return campsites.sort((a, b) => {
      const scoreA = scoreMap.get(a.id) || 0;
      const scoreB = scoreMap.get(b.id) || 0;
      return scoreB - scoreA;
    });
  }

  async getRecommendationForCampsite(userId: string, campsiteId: string) {
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('preferences, accessibility_needs')
      .eq('id', userId)
      .single();

    const { data: campsite } = await supabaseAdmin
      .from('campsites')
      .select('*')
      .eq('id', campsiteId)
      .single();

    if (!user || !campsite) {
      throw new AppError(404, 'User or campsite not found');
    }

    const recommendation = await this.generateRecommendation(
      campsite,
      user.preferences,
      user.accessibility_needs
    );

    // Store recommendation
    await supabaseAdmin
      .from('ai_recommendations')
      .insert({
        user_id: userId,
        campsite_id: campsiteId,
        ...recommendation
      });

    return recommendation;
  }

  async getPersonalizedRecommendations(userId: string, limit: number) {
    // Get user preferences and recent activity
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('preferences, accessibility_needs, saved_campsites')
      .eq('id', userId)
      .single();

    if (!user) {
      throw new AppError(404, 'User not found');
    }

    // Get user's booking history
    const { data: bookings } = await supabaseAdmin
      .from('bookings')
      .select('campsite_id')
      .eq('user_id', userId)
      .eq('status', 'completed')
      .limit(10);

    // Generate search query based on preferences
    const searchQuery = this.buildSearchQueryFromPreferences(user.preferences);
    
    // Search for campsites
    const results = await this.searchCampsites({
      naturalLanguageQuery: searchQuery,
      userId,
      includeRecommendations: true,
      maxResults: limit
    });

    // Filter out already visited or saved campsites
    const visitedIds = (bookings || []).map(b => b.campsite_id);
    const filteredResults = results.campsites.filter(
      c => !visitedIds.includes(c.id) && !user.saved_campsites.includes(c.id)
    );

    return filteredResults;
  }

  private buildSearchQueryFromPreferences(preferences: any): string {
    const parts = [];

    if (preferences.equipmentType) {
      parts.push(`${preferences.equipmentType} camping`);
    }

    if (preferences.favoriteActivities?.length > 0) {
      parts.push(`near ${preferences.favoriteActivities.join(' and ')}`);
    }

    if (preferences.budgetRange) {
      parts.push(`under $${preferences.budgetRange.max} per night`);
    }

    return parts.join(' ') || 'best campsites';
  }
}