# TakasApp - Vehicle Swap Marketplace

## Overview

TakasApp is Turkey's first vehicle swap-focused mobile marketplace. Unlike traditional classified platforms, the core value proposition centers on vehicle exchange (takas) with optional cash difference. The app features Tinder-style swipe matching for compatible swaps, trust scoring, and real-time swap compatibility percentages.

**Key Features:**
- Quick and detailed vehicle listing creation
- Swipe-to-match discovery for compatible swaps
- Real-time chat after mutual matches
- Swap compatibility scoring algorithm
- Trust score system for users
- Vitrin (showcase) for featured listings
- Live video calling between matched users (WebRTC via WebView)
- Push notifications for admin broadcasts

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Mobile Client (Expo/React Native)

The frontend is built with Expo SDK 54 and React Native, supporting iOS, Android, and web platforms.

**Navigation Structure:**
- Root stack navigator handles authentication flow and modal screens
- Bottom tab navigator with 5 tabs: Vitrin (home), Search, Create, Match, Profile
- Native stack navigators for screen-specific flows

**State Management:**
- TanStack Query for server state and caching
- React Context for authentication state (AuthContext)
- AsyncStorage for persistent user session

**UI Framework:**
- Custom themed components (ThemedText, ThemedView, Card, Button)
- Brand colors defined in constants/theme.ts following design guidelines
- Reanimated for animations, Gesture Handler for swipe interactions
- Blur effects and linear gradients for visual polish

**Path Aliases:**
- `@/` maps to `./client/`
- `@shared/` maps to `./shared/`

### Backend Server (Express)

Node.js/Express server with TypeScript handles API requests.

**API Design:**
- RESTful endpoints under `/api/` prefix
- CORS configured for Replit domains and localhost development
- Routes defined in `server/routes.ts` with storage abstraction

**Key Endpoints:**
- `/api/auth/login` - Phone-based authentication
- `/api/users/:id` - User profile management
- `/api/listings` - Vehicle listing CRUD
- `/api/matches` - Swap match management
- `/api/messages` - Chat functionality

### Database (PostgreSQL with Drizzle ORM)

**Schema Design (shared/schema.ts):**
- `users` - Profile data, trust score, verification status, user type (individual/dealer)
- `listings` - Vehicle details, swap preferences, photos, estimated value
- `likes` - Swipe actions between listings
- `matches` - Mutual likes creating conversation opportunities
- `messages` - Chat messages within matches
- `favorites` - Saved listings

**ORM Configuration:**
- Drizzle ORM with PostgreSQL dialect
- Zod schemas generated via drizzle-zod for validation
- Migrations stored in `/migrations` directory

### Shared Code

The `/shared` directory contains code used by both client and server:
- Database schema definitions
- TypeScript types exported for both environments
- Zod validation schemas

## External Dependencies

### Database
- PostgreSQL database provisioned via Replit
- Connection via `DATABASE_URL` environment variable

### Development Tools
- Expo CLI for mobile development
- Metro bundler with proxy configuration for Replit
- ESBuild for server production bundling

### Key npm Packages
- `expo-image-picker` - Vehicle photo capture
- `expo-haptics` - Touch feedback
- `react-native-reanimated` - Swipe card animations
- `react-native-gesture-handler` - Gesture detection
- `@tanstack/react-query` - Data fetching and caching
- `drizzle-orm` / `drizzle-zod` - Database ORM and validation

### Environment Variables Required
- `DATABASE_URL` - PostgreSQL connection string
- `EXPO_PUBLIC_DOMAIN` - API domain for client requests
- `REPLIT_DEV_DOMAIN` - Development domain for CORS