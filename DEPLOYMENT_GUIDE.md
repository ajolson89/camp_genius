# CampExplorer Production Deployment Guide

This guide walks you through deploying the complete CampExplorer backend to production.

## Prerequisites

Before deploying, ensure you have accounts for:
- [Vercel](https://vercel.com) - Backend hosting
- [Supabase](https://supabase.com) - Database & Auth
- [OpenAI](https://openai.com) - AI services
- [Pinecone](https://pinecone.io) - Vector database
- [Upstash](https://upstash.com) - Redis cache
- [Stripe](https://stripe.com) - Payments
- [OpenWeatherMap](https://openweathermap.org) - Weather data
- [Mapbox](https://mapbox.com) - Maps & routing
- [Recreation.gov](https://ridb.recreation.gov) - Campsite data (optional)

## Step 1: Database Setup (Supabase)

### 1.1 Create Supabase Project
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Create new project
3. Choose region closest to your users
4. Save your project URL and keys

### 1.2 Run Database Migrations
1. Go to SQL Editor in Supabase
2. Run the main schema: `backend/supabase/schema.sql`
3. Run notifications schema: `backend/supabase/notifications.sql`
4. Enable required extensions:
   ```sql
   CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
   CREATE EXTENSION IF NOT EXISTS "vector";
   CREATE EXTENSION IF NOT EXISTS "postgis";
   ```

### 1.3 Configure Authentication
1. Go to Authentication → Settings
2. Enable email authentication
3. Configure social providers if needed
4. Set up email templates
5. Configure RLS policies (already in schema)

## Step 2: AI Services Setup

### 2.1 OpenAI Configuration
1. Get API key from [OpenAI Platform](https://platform.openai.com)
2. Set up billing and usage limits
3. Test API access

### 2.2 Pinecone Vector Database
1. Create account at [Pinecone](https://pinecone.io)
2. Create index:
   - Name: `campexplorer-index`
   - Dimensions: 1536 (for OpenAI embeddings)
   - Metric: Cosine
   - Environment: Choose based on your region
3. Save API key and environment

## Step 3: External Services

### 3.1 Upstash Redis
1. Create account at [Upstash](https://upstash.com)
2. Create Redis database
3. Choose region close to your Vercel deployment
4. Save REST URL and token

### 3.2 Stripe Payment Setup
1. Create [Stripe](https://stripe.com) account
2. Get API keys (test and live)
3. Set up webhooks:
   - Endpoint: `https://your-domain.vercel.app/webhooks/stripe`
   - Events: `payment_intent.succeeded`, `payment_intent.payment_failed`
4. Save webhook secret

### 3.3 Weather API (OpenWeatherMap)
1. Create account at [OpenWeatherMap](https://openweathermap.org)
2. Subscribe to One Call API 3.0
3. Get API key

### 3.4 Mapbox
1. Create account at [Mapbox](https://mapbox.com)
2. Get access token
3. Enable required APIs:
   - Directions API
   - Geocoding API
   - Optimization API

### 3.5 Recreation.gov (Optional)
1. Request API key from [RIDB](https://ridb.recreation.gov)
2. Note: This is for government campsite data

## Step 4: Environment Variables

Create production environment variables in Vercel:

### Required Variables
```bash
# Server
NODE_ENV=production

# Database
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_key

# Authentication
JWT_SECRET=your_super_secret_jwt_key_min_32_chars
JWT_EXPIRES_IN=7d

# AI Services
OPENAI_API_KEY=your_openai_api_key
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_ENVIRONMENT=your_pinecone_environment
PINECONE_INDEX_NAME=campexplorer-index

# External APIs
WEATHER_API_KEY=your_openweather_api_key
MAPBOX_API_KEY=your_mapbox_token
RECREATION_GOV_API_KEY=your_recreation_gov_key

# Payment
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# Cache
UPSTASH_REDIS_REST_URL=your_upstash_redis_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_redis_token

# Frontend
FRONTEND_URL=https://your-frontend-domain.vercel.app

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## Step 5: Vercel Deployment

### 5.1 Prepare Repository
1. Ensure all code is committed to Git
2. Push to GitHub/GitLab/Bitbucket

### 5.2 Connect to Vercel
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your repository
4. Select the `backend` folder as root directory

### 5.3 Configure Build Settings
- Framework Preset: Other
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

### 5.4 Add Environment Variables
1. Go to Project Settings → Environment Variables
2. Add all variables from Step 4
3. Make sure they're available for Production environment

### 5.5 Deploy
1. Click "Deploy"
2. Wait for build to complete
3. Test the deployment

## Step 6: Domain Configuration

### 6.1 Custom Domain (Optional)
1. Go to Project Settings → Domains
2. Add your custom domain
3. Configure DNS records as instructed
4. Update FRONTEND_URL environment variable

### 6.2 SSL Certificate
- Vercel automatically provides SSL certificates
- Ensure all URLs use HTTPS

## Step 7: Testing & Verification

### 7.1 Health Check
Test the health endpoint:
```bash
curl https://your-backend-domain.vercel.app/health
```

### 7.2 Authentication Test
```bash
# Register a test user
curl -X POST https://your-backend-domain.vercel.app/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'
```

### 7.3 Database Connection
- Check Supabase dashboard for new user
- Verify tables are created correctly

### 7.4 AI Services Test
```bash
# Test AI search (requires authentication token)
curl -X POST https://your-backend-domain.vercel.app/api/ai/search \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"query":"pet-friendly camping near Yosemite"}'
```

### 7.5 External APIs Test
```bash
# Test weather API
curl "https://your-backend-domain.vercel.app/api/external/weather?lat=37.7749&lng=-122.4194"
```

## Step 8: Monitoring & Maintenance

### 8.1 Set Up Monitoring
1. Enable Vercel Analytics
2. Set up error tracking (Sentry recommended)
3. Monitor API usage for all services
4. Set up billing alerts

### 8.2 Backup Strategy
1. Supabase provides automatic backups
2. Export environment variables
3. Backup Pinecone index regularly

### 8.3 Scaling Considerations
1. Monitor Vercel function execution times
2. Watch Redis cache hit rates
3. Monitor API rate limits
4. Scale AI service quotas as needed

## Step 9: Security Checklist

- [ ] All environment variables are secure
- [ ] JWT secret is cryptographically strong
- [ ] CORS is configured correctly
- [ ] Rate limiting is enabled
- [ ] Webhook signatures are verified
- [ ] Database RLS policies are active
- [ ] API keys have minimal required permissions
- [ ] HTTPS is enforced everywhere

## Step 10: Performance Optimization

### 10.1 Caching Strategy
- Redis cache is configured for:
  - API responses (1 hour)
  - User data (30 minutes)
  - Weather data (30 minutes)
  - Search results (10 minutes)

### 10.2 Database Optimization
- Indexes are created for common queries
- Connection pooling via Supabase
- Row-level security for data isolation

### 10.3 AI Service Optimization
- Vector embeddings cached in Pinecone
- OpenAI responses cached in Redis
- Batch processing for multiple requests

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check Node.js version compatibility
   - Verify all dependencies are installed
   - Check TypeScript compilation errors

2. **Environment Variable Issues**
   - Ensure all required variables are set
   - Check for typos in variable names
   - Verify API keys are active

3. **Database Connection Issues**
   - Check Supabase project status
   - Verify connection strings
   - Check RLS policies

4. **API Rate Limits**
   - Monitor usage dashboards
   - Implement exponential backoff
   - Cache responses aggressively

## Support

For deployment issues:
1. Check Vercel build logs
2. Review Supabase logs
3. Monitor external service status pages
4. Check this repository's Issues tab

## Cost Estimation

Monthly costs (estimated):
- Vercel Pro: $20
- Supabase Pro: $25
- OpenAI API: $50-200 (usage-based)
- Pinecone: $70 (1 pod)
- Upstash: $10
- Stripe: 2.9% + 30¢ per transaction
- Weather API: $0-40 (usage-based)
- Mapbox: $0-50 (usage-based)

**Total: ~$175-415/month** (before transaction fees)

Scale costs based on your expected usage and user growth.