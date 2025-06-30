# CampExplorer Backend

A comprehensive Node.js backend for the CampExplorer AI-powered camping platform.

## Architecture Overview

### Tech Stack
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL via Supabase
- **Authentication**: JWT with Supabase Auth
- **AI Services**: OpenAI GPT-4, Pinecone Vector DB
- **Payment**: Stripe
- **Caching**: Redis via Upstash
- **Deployment**: Vercel Serverless Functions

### Key Features
- AI-powered campsite search and recommendations
- Natural language processing for search queries
- Real-time availability management
- Secure payment processing
- User preference learning
- Accessibility-first design
- Multi-stop trip planning

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL (via Supabase)
- Redis (via Upstash)
- API Keys for OpenAI, Pinecone, Stripe, etc.

### Installation

1. Clone the repository
2. Install dependencies:
```bash
cd backend
npm install
```

3. Copy environment variables:
```bash
cp .env.example .env
```

4. Configure your `.env` file with required API keys

5. Set up the database:
   - Create a Supabase project
   - Run the schema file in `supabase/schema.sql`

6. Start the development server:
```bash
npm run dev
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh JWT token

### Users
- `GET /api/users/me` - Get current user profile
- `PATCH /api/users/me` - Update user profile
- `GET /api/users/me/saved-campsites` - Get saved campsites
- `POST /api/users/me/saved-campsites/:id` - Save/unsave campsite
- `GET /api/users/me/pets` - Get user's pets
- `POST /api/users/me/pets` - Add a pet
- `DELETE /api/users/me/pets/:id` - Remove a pet

### Campsites
- `GET /api/campsites` - Search campsites with filters
- `GET /api/campsites/:id` - Get campsite details
- `GET /api/campsites/:id/availability` - Check availability

### Bookings
- `GET /api/bookings` - Get user's bookings
- `GET /api/bookings/:id` - Get booking details
- `POST /api/bookings` - Create booking
- `POST /api/bookings/:id/cancel` - Cancel booking

### Trips
- `GET /api/trips` - Get user's trips
- `GET /api/trips/:id` - Get trip details
- `POST /api/trips` - Create trip
- `PATCH /api/trips/:id` - Update trip
- `DELETE /api/trips/:id` - Delete trip

### AI Services
- `POST /api/ai/search` - AI-powered campsite search
- `POST /api/ai/chat` - Chat with AI assistant
- `GET /api/ai/chat/history` - Get chat history
- `GET /api/ai/recommendations` - Get personalized recommendations
- `GET /api/ai/recommendations/campsite/:id` - Get campsite recommendation score

## Database Schema

### Core Tables
- `users` - User accounts and preferences
- `campsites` - Campsite listings with vector embeddings
- `bookings` - Reservation records
- `trips` - Multi-campsite trip planning
- `availability` - Real-time availability tracking
- `reviews` - User reviews and ratings
- `chat_messages` - AI assistant conversation history
- `ai_recommendations` - Personalized recommendation scores

## AI Integration

### Search Pipeline
1. Natural language query parsing
2. Entity extraction and intent recognition
3. Vector embedding generation
4. Semantic search in Pinecone
5. Filter application and ranking
6. Personalization layer

### Recommendation Engine
- User preference learning
- Collaborative filtering
- Content-based filtering
- Accessibility matching
- Dynamic scoring

## Security

- JWT-based authentication
- Row-level security in Supabase
- Rate limiting per IP
- Input validation with Zod
- CORS configuration
- Webhook signature verification

## Development

### Commands
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run typecheck` - Type checking
- `npm start` - Start production server

### Project Structure
```
backend/
├── src/
│   ├── config/        # Configuration files
│   ├── controllers/   # Route controllers
│   ├── middleware/    # Express middleware
│   ├── routes/        # API routes
│   ├── services/      # Business logic
│   ├── types/         # TypeScript types
│   └── utils/         # Utility functions
├── supabase/          # Database migrations
└── package.json
```

## Deployment

The backend is designed for serverless deployment on Vercel. Each route can be deployed as an independent serverless function for optimal scaling.

## Environment Variables

See `.env.example` for required environment variables.

## License

Proprietary - CampExplorer