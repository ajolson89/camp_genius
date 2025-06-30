# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Camp Genius is a React + TypeScript campsite booking and planning application built with Vite. It features AI-powered search, accessibility features, weather integration, and route planning capabilities.

## Development Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linting
npm run lint
```

## Architecture

### Key Technologies
- **React 18.3.1** with TypeScript
- **Vite** as build tool
- **Framer Motion** for animations
- **TailwindCSS** for styling
- **Lucide React** for icons

### Application Structure

The app uses a custom page-based routing system implemented in `src/App.tsx` without React Router. Navigation is managed through the `currentPage` state with these main pages:
- `home` - Landing page with hero section
- `dashboard` - User dashboard
- `map` - Map view page
- `profile` - User profile
- `route-planner` - Trip planning
- `campsite-detail` - Individual campsite details
- `search-results` - Search results listing

### Data Flow
- Mock data is stored in `src/data/mockData.ts`
- Types are defined in `src/types/index.ts`
- State management is handled at the App component level
- AI search functionality is implemented directly in App.tsx

### Component Organization
- Reusable components in `/src/components/`
- Page components in `/src/pages/`
- Each component is self-contained with its own styling and logic

## Important Notes

- No testing framework is currently configured
- No routing library is used - navigation is handled via state
- All data is currently mocked - no backend API integration
- Accessibility is a core feature with dedicated components and state management