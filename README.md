# CampExplorer - AI-Powered Camping Platform

CampExplorer revolutionizes outdoor recreation planning with AI-first experiences, comprehensive accessibility features, and unified campsite search across government and private platforms.

## Project Overview

### Market Opportunity
- **$53.1B** camping market growing to **$117.6B** by 2030
- **87.99M** North American campers
- Significant accessibility gaps in current solutions

### Core Value Propositions
1. **AI-First Experience**: Natural language search, intelligent recommendations, conversational booking
2. **Accessibility Leadership**: Comprehensive accessibility verification and filtering
3. **Unified Search Platform**: Government sites (Recreation.gov) + private campgrounds + unique stays
4. **Advanced Route Planning**: RV-specific routing with restrictions and multi-destination coordination
5. **Weather Intelligence**: Hyperlocal forecasts with dynamic rebooking suggestions

## Architecture

### Frontend
- **Framework**: React 18.3.1 + TypeScript
- **Build Tool**: Vite
- **Styling**: TailwindCSS
- **State Management**: React hooks
- **Deployment**: Vercel

### Backend
- **Runtime**: Node.js + TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL (Supabase)
- **AI Services**: OpenAI GPT-4 + Pinecone
- **Payment**: Stripe
- **Caching**: Redis (Upstash)
- **Deployment**: Vercel Serverless

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account
- OpenAI API key
- Pinecone account
- Stripe account

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/camp_genius.git
cd camp_genius
```

2. Install frontend dependencies:
```bash
npm install
```

3. Install backend dependencies:
```bash
cd backend
npm install
```

4. Set up environment variables:
```bash
# Backend
cd backend
cp .env.example .env
# Edit .env with your API keys
```

5. Set up the database:
   - Create a Supabase project
   - Run the schema: `backend/supabase/schema.sql`
   - Enable required extensions (uuid-ossp, vector, postgis)

6. Start development servers:

Frontend:
```bash
npm run dev
```

Backend:
```bash
cd backend
npm run dev
```

## Deployment

### Frontend Deployment (Vercel)

1. Connect your GitHub repository to Vercel
2. Configure build settings:
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`

3. Add environment variables:
   - `VITE_API_URL`: Your backend URL
   - `VITE_STRIPE_PUBLIC_KEY`: Stripe publishable key

### Backend Deployment (Vercel Serverless)

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy from backend directory:
```bash
cd backend
vercel
```

3. Configure environment variables in Vercel dashboard:
   - All variables from `.env.example`

### Database Setup (Supabase)

1. Create a new Supabase project
2. Go to SQL Editor
3. Run the schema from `backend/supabase/schema.sql`
4. Enable RLS policies
5. Configure authentication providers

### Vector Database (Pinecone)

1. Create a Pinecone account
2. Create an index named `campexplorer-index`
3. Configure index:
   - Dimensions: 1536 (for OpenAI embeddings)
   - Metric: Cosine
   - Pods: 1 (start with free tier)

### Redis Cache (Upstash)

1. Create an Upstash account
2. Create a Redis database
3. Copy REST URL and token to environment variables

## Production Checklist

### Security
- [ ] Enable HTTPS everywhere
- [ ] Configure CORS properly
- [ ] Set up rate limiting
- [ ] Enable Supabase RLS
- [ ] Rotate all API keys
- [ ] Set up monitoring (Sentry)

### Performance
- [ ] Enable Redis caching
- [ ] Optimize database queries
- [ ] Set up CDN for assets
- [ ] Enable gzip compression
- [ ] Implement lazy loading

### SEO & Analytics
- [ ] Add meta tags
- [ ] Set up Google Analytics
- [ ] Configure sitemap
- [ ] Add OpenGraph tags

## API Documentation

See `/backend/README.md` for complete API documentation.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

Proprietary - CampExplorer

## Support

For support, email support@campexplorer.com# Deployment trigger - Mon Jun 30 08:05:57 MDT 2025
# Deploy hooks enabled - Mon Jun 30 08:11:19 MDT 2025
