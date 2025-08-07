# MY PUP - Dog Listing Platform

## Overview

MY PUP is a comprehensive dog listing platform connecting dog lovers with breeders, rescues, and individual sellers. It serves as a marketplace for buying and selling dogs, offering integrated messaging, educational resources, and safety features. The platform aims to provide a trusted and efficient environment for dog adoption and sales, with a vision for substantial market potential in the pet industry. Key capabilities include a robust search experience, a consistent design system, and a highly responsive user interface with reliable navigation.

## User Preferences

Preferred communication style: Simple, everyday language.

**Important: Preserve all existing Supabase functionality**
- Keep all Supabase client calls, authentication, and storage intact
- Do not remove or replace any existing Supabase integration
- Supabase remains the primary backend service for this application

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
- **Admin & Moderation**: Dedicated admin panel with detailed logging, user reporting, abuse protection, and comprehensive monitoring capabilities.
- **Compliance**: GDPR and privacy compliance features including data export, account deletion, privacy policy, and cookie consent.
- **UI/UX Decisions**: Implemented a comprehensive Tailwind design token system with automated compliance enforcement, including a standardized color palette, typography scale, spacing grid, and animation tokens. The search experience is Instagram-style with comprehensive database coverage and no auto-redirects, featuring advanced keyboard navigation, visual consistency, and full mouse/touch interaction support.
- **Technical Implementations**: Solutions for performance issues include stabilizing filter states with `useMemo`, serializing query keys, and using `useCallback` for handlers. Navigation issues were resolved by stabilizing `AuthContext`, fixing React Hooks order violations, and implementing comprehensive navigation guard logic to prevent loops and redundant redirects. Timeout diagnostics and non-blocking fallback UIs were added to prevent silent hangs during data fetching. The Instagram-style search implementation features a consolidated StickyHeader with SearchBar integration, complete removal of legacy query parameter redirects, and proper button elements for accessibility and mobile touch support. **COMPLETED (Aug 2025)**: Fixed critical search navigation by removing form wrapper that intercepted React Router Link clicks, full conversion from wouter to React Router with proper `/profile/{userId}` path patterns, and admin shield implementation with loading state management and multi-field role checking (is_admin, role, user_type). **COMPLETED (Aug 2025)**: Successfully implemented admin shield access by fixing AuthContext dependency array to include `authState.profile`, ensuring proper state propagation from useAuthState to StickyHeader component. Admin status is granted to creator account (ID: 8b7adf6a-eb74-43a0-9a26-575e65886ac5) with is_admin: true flag, enabling access to admin dashboard with comprehensive logging and navigation tracking. **COMPLETED (Aug 2025)**: Phase 4-A QA infrastructure fully operational with bug tracking. Phase 4-B monetization system implemented with Stripe integration, platform commissions, boosted listings, provider subscriptions, and payment processing. Phase 4-C legal compliance completed with Terms of Service, Privacy Policy, Community Guidelines, and legal checkbox components. Database schema expanded with monetization tables and test data seeding capabilities.

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