import { OpenAI } from 'openai';
import { config } from '../config/env';
import { supabaseAdmin } from '../config/database';
import { ChatMessage, SuggestedAction } from '../types';
import { AppError } from '../middleware/errorHandler';

export class AIAssistantService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: config.ai.openaiApiKey
    });
  }

  async processMessage({
    userId,
    message,
    context
  }: {
    userId: string;
    message: string;
    context?: any;
  }) {
    try {
      // Get user profile and recent activity
      const userContext = await this.getUserContext(userId);
      
      // Get chat history
      const chatHistory = await this.getChatHistory(userId, 10);
      
      // Generate AI response
      const aiResponse = await this.generateResponse(
        message,
        userContext,
        chatHistory,
        context
      );
      
      // Save messages to database
      const userMessage = await this.saveMessage({
        userId,
        role: 'user',
        content: message
      });
      
      const assistantMessage = await this.saveMessage({
        userId,
        role: 'assistant',
        content: aiResponse.content,
        suggestedActions: aiResponse.suggestedActions
      });
      
      return assistantMessage;
    } catch (error) {
      console.error('AI Assistant error:', error);
      throw new AppError(500, 'Failed to process message');
    }
  }

  private async getUserContext(userId: string) {
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('*, pets(*)')
      .eq('id', userId)
      .single();
    
    const { data: recentBookings } = await supabaseAdmin
      .from('bookings')
      .select('*, campsites(name, location)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5);
    
    const { data: upcomingTrips } = await supabaseAdmin
      .from('trips')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'upcoming')
      .order('start_date')
      .limit(3);
    
    return {
      user,
      recentBookings,
      upcomingTrips
    };
  }

  async getChatHistory(userId: string, limit: number, offset: number = 0) {
    const { data: messages, error } = await supabaseAdmin
      .from('chat_messages')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (error) {
      throw new AppError(500, 'Failed to fetch chat history');
    }
    
    return (messages || []).reverse();
  }

  private async generateResponse(
    message: string,
    userContext: any,
    chatHistory: ChatMessage[],
    pageContext?: any
  ) {
    const systemPrompt = `You are CampExplorer AI, a helpful camping assistant. You help users find and book campsites, plan trips, and answer camping-related questions.

User Context:
- Name: ${userContext.user?.name}
- Preferred Equipment: ${userContext.user?.preferences?.equipmentType}
- Accessibility Needs: ${JSON.stringify(userContext.user?.accessibility_needs)}
- Pets: ${userContext.user?.pets?.map((p: any) => `${p.name} (${p.type})`).join(', ')}

Recent Activity:
- Recent Bookings: ${userContext.recentBookings?.map((b: any) => b.campsites.name).join(', ')}
- Upcoming Trips: ${userContext.upcomingTrips?.map((t: any) => t.name).join(', ')}

Current Page Context: ${pageContext ? JSON.stringify(pageContext) : 'None'}

Guidelines:
1. Be friendly, helpful, and concise
2. Suggest relevant actions based on the conversation
3. Consider user's preferences and accessibility needs
4. Provide personalized recommendations
5. Include suggested actions when appropriate (search, booking, route planning, etc.)`;

    const messages = [
      { role: 'system' as const, content: systemPrompt },
      ...chatHistory.map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content
      })),
      { role: 'user' as const, content: message }
    ];

    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages,
      temperature: 0.7,
      max_tokens: 500
    });

    const responseContent = completion.choices[0].message.content || '';
    
    // Extract suggested actions from the response
    const suggestedActions = await this.extractSuggestedActions(
      responseContent,
      message,
      pageContext
    );
    
    return {
      content: responseContent,
      suggestedActions
    };
  }

  private async extractSuggestedActions(
    aiResponse: string,
    userMessage: string,
    pageContext?: any
  ): Promise<SuggestedAction[]> {
    const prompt = `Based on this conversation, extract 0-3 suggested actions the user might want to take.

User Message: ${userMessage}
AI Response: ${aiResponse}
Current Page: ${pageContext?.currentPage || 'unknown'}

Return a JSON array of suggested actions. Each action should have:
- type: "search" | "booking" | "route" | "weather" | "recommendation"
- label: A short, actionable label (e.g., "Search for pet-friendly campsites")
- data: Relevant data for the action (e.g., search filters, campsite ID, etc.)

If no actions are appropriate, return an empty array.`;

    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'Extract suggested actions from the conversation.' },
          { role: 'user', content: prompt }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.3
      });

      const result = JSON.parse(completion.choices[0].message.content || '{}');
      return result.actions || [];
    } catch (error) {
      console.error('Failed to extract suggested actions:', error);
      return [];
    }
  }

  private async saveMessage(message: {
    userId: string;
    role: string;
    content: string;
    suggestedActions?: SuggestedAction[];
  }) {
    const { data, error } = await supabaseAdmin
      .from('chat_messages')
      .insert({
        user_id: message.userId,
        role: message.role,
        content: message.content,
        suggested_actions: message.suggestedActions
      })
      .select()
      .single();
    
    if (error || !data) {
      throw new AppError(500, 'Failed to save message');
    }
    
    return data;
  }
}