# MY PUP - Dog Listing Platform

## Overview

MY PUP is a comprehensive dog listing platform connecting dog lovers with breeders, rescues, and individual sellers. It serves as a marketplace for buying and selling dogs, offering integrated messaging, educational resources, and safety features. The platform aims to provide a trusted and efficient environment for dog adoption and sales, with a vision for substantial market potential in the pet industry.

## Recent Changes (August 1, 2025)

✅ **Navigation Freeze Issue COMPLETELY RESOLVED**: Fixed critical navigation freeze where UI would become unresponsive when clicking between Home/Explore tabs for authenticated users.

**Root Cause Analysis:**
- AuthContext was creating new context values on every render due to unstable function references
- React hooks order violations were causing app crashes during hot reloads
- Excessive re-renders were cascading through the entire component tree
- Navigation guard logic was not preventing redundant navigation attempts

**Comprehensive Solution Implemented:**
- **Stabilized AuthContext**: Context now only recreates when core identity changes (user ID, session token, loading state)
- **Fixed React Hooks Order**: Removed problematic useCallback hooks that violated hooks rules
- **Added Comprehensive Instrumentation**: Detailed logging throughout navigation components for debugging
- **Prevented Redirect Loops**: Guard logic now detects and prevents navigation to same routes
- **Optimized Render Cycles**: Components now mount exactly once per navigation instead of multiple times
- **Added Proper Loading States**: Loading indicators while authentication resolves

**Technical Details:**
- Updated `AuthContext.tsx` with stable useMemo dependencies
- Fixed `useAuthState.ts` hooks order violations
- Enhanced `BottomNavigation.tsx` with redundant navigation prevention
- Improved `ExploreRouter.tsx` and `Home.tsx` with stable user identity tracking
- Added comprehensive logging to all navigation components

**Result**: Navigation between Home, Explore, Messages, and Profile is now instant and responsive. No more context recreation spam, components render efficiently, and the user experience is smooth for all authenticated users.

✅ **Data Fetch Guards & Auth Stabilization COMPLETED**: Implemented comprehensive fetch protection and auth state stabilization.

**Fetch Guard Implementation:**
- **One-time Fetch Guards**: Added ref-based guards (`hasFetchedListingsRef`, `hasFetchedPostsRef`) to prevent infinite fetch loops
- **Auth-Gated Fetching**: All data fetches now wait for auth loading to complete before executing
- **Early Return Loading States**: Components show loading spinners while auth is resolving, preventing premature renders with undefined user
- **Comprehensive Logging**: Clear console logs for fetch start, completion, errors, and auth state changes
- **Reset on Unmount**: Fetch guards properly reset when components unmount

**Auth Context Stabilization:**
- **Stable Context Value**: AuthContext already properly memoized with stable dependencies (user ID, session token, loading state)
- **Premature Render Prevention**: Page components now early-return loading spinners while `auth.loading === true`
- **Clean Auth Settlement**: Components only render full content after auth state stabilizes

**Technical Implementation:**
- Updated `ExploreAuth.tsx` with fetch guards and early loading return
- Updated `HomeFeed.tsx` with one-time fetch guard and API call fixes
- Updated `HomeFeed.tsx` (page) with early loading return and auth settlement logging
- All components now log when showing loading spinners and when auth settles

**Expected Behavior:**
- Clean auth state resolution without premature renders
- Exactly one data fetch per component visit
- No infinite loops, race conditions, or freezing
- Responsive UI throughout navigation with proper loading states

✅ **Navigation Guard Logic HARDENED**: Comprehensive audit and fix of all navigation guard redirects to prevent loops and redundant navigation.

**Navigation Guard Hardening:**
- **Redundant Redirect Prevention**: All guards now check if already on target path before redirecting
- **Enhanced Logging**: Clear console logs show guard decisions: "Already on target, skipping" or "Redirecting from X to Y"
- **Consistent Guard Pattern**: Standardized guard logic across all components (HomeFeed, Home, RequireAuth, ProtectedRoute)
- **Loop Prevention**: Guards skip execution if current path equals target path
- **Decision Transparency**: Detailed logging of guard decisions for debugging

**Technical Implementation:**
- Updated `HomeFeed.tsx` guard to check current vs target path before redirecting
- Updated `Home.tsx` guard with hardened path checking logic
- Updated `RequireAuth.tsx` to prevent redirects when already on target path
- Updated `ProtectedRoute.tsx` with enhanced logging and guard logic
- Standardized "[NAV GUARD]" logging prefix for all guard decisions

**Expected Navigation Flow:**
- Instant tab switching between Home, Explore, Messages, Profile
- No redundant navigation logs or guard-induced stalling
- Clean console logs showing guard decisions and skipped redundant redirects
- URL and UI change immediately without navigation delays

✅ **Critical Navigation Bug Fixed** (July 31): Resolved authentication flow issue where authenticated users couldn't navigate between protected routes (Home, Messages, Profile). 
- **Root Cause**: API client wasn't sending Supabase JWT tokens in Authorization headers
- **Solution**: Updated `client/src/lib/api.ts` to automatically include `Authorization: Bearer <token>` headers
- **Result**: Bottom navigation tabs now work correctly for authenticated users while maintaining RequireAuth guards

## User Preferences

Preferred communication style: Simple, everyday language.

**Important: Preserve all existing Supabase functionality**
- Keep all Supabase client calls, authentication, and storage intact
- Do not remove or replace any existing Supabase integration
- Supabase remains the primary backend service for this application

## System Architecture

The application employs a full-stack architecture with a clear separation of concerns:

**Frontend**: React 18 with TypeScript, using Vite for build tooling.
**Backend**: Express.js server with TypeScript.
**Database**: PostgreSQL, managed with Drizzle ORM for type-safe operations.
**Authentication & Real-time**: Supabase Auth for user management and real-time subscriptions.
**Styling**: Tailwind CSS, augmented by the shadcn/ui component library.

### Core Architectural Decisions:
- **Modular Component Structure**: Frontend components are organized by feature (e.g., messaging, listings).
- **State Management**: React Context for global state (Auth, Theme) and React Query for server state.
- **RESTful API**: Backend exposes RESTful endpoints, with handlers organized by feature.
- **ORM-driven Database Layer**: Drizzle ORM ensures type safety and a schema-first approach for database interactions.
- **Responsive Design**: Mobile-first approach with responsive UI components and bottom navigation.
- **Authentication Flow**: Supabase handles user authentication, profile synchronization with PostgreSQL, and protected routes. Includes guest browsing, session management (with timeout and refresh), and secure token handling.
- **Scalable Features**: Designed for real-time messaging, robust listing management, advanced search with AI recommendations, fraud detection, comprehensive refund and commission tracking, and extensive social features (e.g., likes, comments, following, saved posts).
- **Admin & Moderation**: Dedicated admin panel with detailed logging, user reporting, abuse protection, and comprehensive monitoring capabilities.
- **Compliance**: GDPR and privacy compliance features including data export, account deletion, privacy policy, and cookie consent.

## External Dependencies

### Core Technologies
- **@neondatabase/serverless**: PostgreSQL connection pooling.
- **@supabase/supabase-js**: Supabase client for auth, real-time, and storage.
- **drizzle-orm**: ORM for PostgreSQL.
- **@tanstack/react-query**: Server state management.

### UI & Styling
- **@radix-ui/**: Accessible UI primitives.
- **tailwindcss**: Utility-first CSS framework.
- **class-variance-authority**: Component variant management.
- **lucide-react**: Icon library.

### Development & Production Tools
- **tsx**: TypeScript execution.
- **esbuild**: Fast JavaScript bundler.
- **vite**: Development server and build tool.
- **Sentry**: Error tracking.
- **SendGrid**: Email service.
- **Google Analytics 4**: Analytics tracking.
- **OpenAI API**: AI-powered content moderation.