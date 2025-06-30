# Backend Deployment Guide

This guide will help you deploy the Camp Genius backend to various platforms.

## Prerequisites

Before deploying, ensure you have all the required environment variables:

```bash
# Database (Supabase)
DATABASE_URL=
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_KEY=

# Authentication
JWT_SECRET=
JWT_EXPIRES_IN=

# OpenAI (for AI features)
OPENAI_API_KEY=

# Pinecone (for vector search)
PINECONE_API_KEY=
PINECONE_ENVIRONMENT=
PINECONE_INDEX_NAME=

# Mapbox (for location services)
MAPBOX_ACCESS_TOKEN=

# Weather API
OPENWEATHER_API_KEY=

# Recreation.gov API
RECREATION_GOV_API_KEY=

# Stripe (for payments)
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# Email (optional)
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
EMAIL_FROM=

# Server
PORT=3000
NODE_ENV=production
FRONTEND_URL=https://your-frontend-url.vercel.app
```

## Deployment Options

### Option 1: Deploy to Railway (Recommended)

Railway is the easiest option for deploying the backend with automatic SSL and database provisioning.

1. **Install Railway CLI** (optional):
   ```bash
   npm install -g @railway/cli
   ```

2. **Deploy via GitHub**:
   - Go to [Railway](https://railway.app)
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your repository
   - Railway will auto-detect the Node.js app

3. **Configure Environment Variables**:
   - Go to your project settings
   - Add all environment variables from the list above
   - Railway provides a PostgreSQL database - use its DATABASE_URL

4. **Set Build Command**:
   ```bash
   cd backend && npm install && npm run build
   ```

5. **Set Start Command**:
   ```bash
   cd backend && npm start
   ```

### Option 2: Deploy to Render

1. **Create a New Web Service**:
   - Go to [Render](https://render.com)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository

2. **Configure Build Settings**:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`

3. **Add Environment Variables**:
   - Go to Environment tab
   - Add all required variables

### Option 3: Deploy to Heroku

1. **Install Heroku CLI**:
   ```bash
   brew tap heroku/brew && brew install heroku
   ```

2. **Create Heroku App**:
   ```bash
   heroku create camp-genius-backend
   ```

3. **Add Buildpack**:
   ```bash
   heroku buildpacks:add heroku/nodejs
   ```

4. **Deploy**:
   ```bash
   git subtree push --prefix backend heroku main
   ```

5. **Set Environment Variables**:
   ```bash
   heroku config:set DATABASE_URL=... OPENAI_API_KEY=... # etc
   ```

### Option 4: Deploy to Vercel (Serverless)

The backend already has Vercel configuration for serverless deployment.

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Deploy**:
   ```bash
   cd backend
   vercel
   ```

3. **Configure Environment Variables**:
   - Go to Vercel dashboard
   - Project Settings → Environment Variables
   - Add all required variables

## Post-Deployment Steps

### 1. Update Frontend Environment

Create a `.env` file in your frontend:
```bash
VITE_API_URL=https://your-backend-url.railway.app
```

### 2. Configure CORS

Ensure your backend allows requests from your frontend URL:
- Update `FRONTEND_URL` environment variable
- The backend already has CORS configured to use this

### 3. Test the Connection

1. **Test the API directly**:
   ```bash
   curl https://your-backend-url.railway.app/api/health
   ```

2. **Test from frontend**:
   - Open browser console
   - Make a search query
   - Check for API calls in Network tab

### 4. Set up Webhooks (if using Stripe)

Update Stripe webhook endpoint to:
```
https://your-backend-url.railway.app/api/webhooks/stripe
```

## Troubleshooting

### Backend not starting
- Check logs in your deployment platform
- Ensure all environment variables are set
- Verify DATABASE_URL is correct

### CORS errors
- Check FRONTEND_URL environment variable
- Ensure it matches your deployed frontend URL
- Try adding trailing slash if needed

### API calls failing
- Check browser console for errors
- Verify VITE_API_URL in frontend
- Ensure backend is running (check deployment logs)
- Test API endpoint directly with curl

### Database connection issues
- Verify DATABASE_URL format
- For Supabase, ensure all SUPABASE_* variables are set
- Check if database accepts connections from deployment platform

## Local Development

To test the full stack locally:

1. **Start backend**:
   ```bash
   cd backend
   npm install
   npm run dev
   ```

2. **Start frontend with local API**:
   ```bash
   # In root directory
   echo "VITE_API_URL=http://localhost:3000" > .env
   npm run dev
   ```

## Security Notes

- Never commit `.env` files
- Use different JWT_SECRET for production
- Enable rate limiting in production
- Keep API keys secure
- Use HTTPS for all production deployments