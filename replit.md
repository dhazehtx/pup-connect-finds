# MY PUP - Dog Listing Platform

## Overview

MY PUP is a comprehensive dog listing platform connecting dog lovers with breeders, rescues, and individual sellers. It serves as a marketplace for buying and selling dogs, offering integrated messaging, educational resources, and safety features. The platform aims to provide a trusted and efficient environment for dog adoption and sales, with a vision for substantial market potential in the pet industry. Key capabilities include a robust search experience, a consistent design system, and a highly responsive user interface with reliable navigation.

## User Preferences

Preferred communication style: Simple, everyday language.

**Data Architecture (Neon/Drizzle Migration)**
- Neon/Drizzle is the SINGLE source of truth for all app domains: posts, comments, likes, follows, favorites, listings, messages, conversations, notifications, marketplace
- Supabase is reserved ONLY for Auth + Storage (no data reads/writes for app domains)
- Phase 1-2 Complete: Posts, Comments, Follows, Post Likes, Favorites migrated
- Phase 3 Complete (Feb 2026): Messaging/Conversations fully migrated to Neon/Drizzle API
  - All .from('messages') and .from('conversations') Supabase calls eliminated from client code
  - 9 REST endpoints for messaging at /api/messaging/*
  - Socket.io replaces Supabase Realtime for typing indicators, presence, and real-time message delivery
  - server/socket.ts: Socket.io server with Supabase JWT auth
  - client/src/hooks/useSocket.ts: Global singleton Socket.io client
  - All 5 typing/presence hooks migrated: useTypingIndicator, useTypingIndicators, useRealtimeTyping, useUserPresence, usePresenceManager
  - WebRTC signaling hook migrated from Supabase channels to Socket.io
  - GDPR messaging export/deletion uses Drizzle in server/routes/user.ts

## System Architecture

The application employs a full-stack architecture with a clear separation of concerns.

**Frontend**: React 18 with TypeScript, using Vite for build tooling.
**Backend**: Express.js server with TypeScript.
**Database**: PostgreSQL, managed with Drizzle ORM for type-safe operations.
**Authentication & Real-time**: Supabase Auth for user management and real-time subscriptions.
**Styling**: Tailwind CSS, augmented by the shadcn/ui component library.
**Payments**: Stripe integration for monetization, subscriptions, and commission tracking.

### Core Architectural Decisions:
- **Modular Component Structure**: Frontend components are organized by feature (e.g., messaging, listings).
- **State Management**: React Context for global state (Auth, Theme) and React Query for server state.
- **RESTful API**: Backend exposes RESTful endpoints, with handlers organized by feature.
- **ORM-driven Database Layer**: Drizzle ORM ensures type safety and a schema-first approach for database interactions.
- **Responsive Design**: Mobile-first approach with responsive UI components and bottom navigation.
- **Authentication Flow**: Supabase handles user authentication, profile synchronization with PostgreSQL, and protected routes. Includes guest browsing, session management (with timeout and refresh), and secure token handling.
- **Scalable Features**: Designed for real-time messaging, robust listing management, advanced search with AI recommendations, fraud detection, comprehensive refund and commission tracking, and extensive social features (e.g., likes, comments, following, saved posts).
- **Admin & Moderation**: Dedicated admin panel with detailed logging, user reporting, abuse protection, and comprehensive monitoring capabilities. **Provider Application Review System**: Comprehensive admin review workflow for service provider applications with database-driven access control (profiles.is_admin). Features include: detailed application view with user profile information (username, email, phone, location), provider business details, secure ID verification photo display with signed Supabase storage URLs (1-hour expiry), admin review notes, and approve/reject actions. Review metadata (reviewed_at, reviewed_by, review_notes) is persisted to the provider_applications table using Drizzle ORM. The frontend uses a Sheet drawer component for the review UI with proper data-testid attributes for testing. API architecture uses Neon (DATABASE_URL/Drizzle) for application data storage and Supabase for auth/storage only. **Admin Dashboard Implementation** (Complete): Created comprehensive server/routes/adminDashboard.ts with real Drizzle/Neon queries for metrics, user management, orders, analytics, and settings. All endpoints use explicit column selection and proper conditional query building using `$dynamic()` method to prevent TypeScript errors. Added platform_settings table for admin configuration. Added last_login_at timestamp field to profiles table for accurate activity tracking. **Login Tracking Pipeline**: Implemented via Supabase direct update in client/src/utils/authStateListener.ts - on SIGNED_IN event, the user's last_login_at is updated via Supabase RLS, enabling accurate "active users in last 30 days" metrics in the admin dashboard.
- **Compliance**: GDPR and privacy compliance features including data export, account deletion, privacy policy, and cookie consent. **Legal Compliance System**: Comprehensive liability protection framework with updated Terms of Service (marketplace disclaimer, release of liability, indemnification, arbitration clauses), Privacy Policy with payment/dispute disclaimers, user consent tracking system (user_consents table stores consent versions, IP addresses, user agents, timestamps), and RiskDisclaimer component for high-risk actions (Stripe onboarding, bookings). Auth signup flow automatically records both Terms and Privacy consent with metadata using the Supabase signup response data. Consent recording API endpoint (/api/consent/record) validates payloads with Zod schema before persisting to database.
- **Stripe Connect Integration**: Stripe account data is stored in both providers and profiles tables for efficient querying. The profiles table includes stripe_account_id and stripe_connected fields, which are automatically synced when providers connect their Stripe accounts and when webhook events update account status. OnboardingHydrator queries profiles table directly using authenticated user's UUID. Migration 20251015_add_stripe_to_profiles.sql added these fields with proper indexing.
- **UI/UX Decisions**: Implemented a comprehensive Tailwind design token system with automated compliance enforcement, including a standardized color palette (primarily blue-themed), typography scale, spacing grid, and animation tokens. The search experience is Instagram-style with comprehensive database coverage and no auto-redirects, featuring advanced keyboard navigation, visual consistency, and full mouse/touch interaction support. All yellow/amber/orange colors have been systematically purged from the application, ensuring a consistent blue and white theme across all interfaces (desktop and mobile). This includes analytics components, admin dashboard, trust & safety tools, messaging oversight, subscription/escrow analytics, profile components, and logo assets. A centralized theme system using CSS variables ensures visual consistency. Pill tab styling has been implemented for navigation elements, particularly in the marketplace with proper segmented control design (white container background, blue active tabs with white text, white inactive tabs with blue text). Guest and authenticated user experiences now have feature parity for explore functionality, including advanced filters (breed selection, price range, age range, location), view mode toggles (grid/list), and tabbed content organization (puppy listings and community posts). Cookie consent banner uses consistent blue backgrounds with white text across all buttons. Product prices in store tabs display in black text for proper visibility. Input field styling uses gray borders with blue focus states, removing any yellow/amber visual elements.
- **Technical Implementations**: Solutions for performance issues include stabilizing filter states with `useMemo`, serializing query keys, and using `useCallback` for handlers. Navigation issues were resolved by stabilizing `AuthContext`, fixing React Hooks order violations, and implementing comprehensive navigation guard logic to prevent loops and redundant redirects. Timeout diagnostics and non-blocking fallback UIs were added to prevent silent hangs during data fetching. The Instagram-style search implementation features a consolidated StickyHeader with SearchBar integration, complete removal of legacy query parameter redirects, and proper button elements for accessibility and mobile touch support. Admin shield access is implemented with loading state management and multi-field role checking.

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