# MY PUP - Dog Listing Platform

## Overview

MY PUP is a comprehensive dog listing platform connecting dog lovers with breeders, rescues, and individual sellers. It serves as a marketplace for buying and selling dogs, offering integrated messaging, educational resources, and safety features. The platform aims to provide a trusted and efficient environment for dog adoption and sales, with a vision for substantial market potential in the pet industry. Key capabilities include a robust search experience, a consistent design system, and a highly responsive user interface with reliable navigation.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

The application employs a full-stack architecture with a clear separation of concerns, using React 18 with TypeScript on the frontend (Vite), and an Express.js server with TypeScript on the backend. The database is PostgreSQL, managed with Drizzle ORM. Authentication is handled by Supabase Auth, and styling is managed with Tailwind CSS and shadcn/ui. Stripe integration is used for payments.

### Core Architectural Decisions:

-   **Data Architecture**: Neon/Drizzle is the single source of truth for all application domains (posts, comments, likes, follows, favorites, listings, messages, conversations, notifications, marketplace, profiles). Supabase is reserved exclusively for Authentication and Storage. Messaging, Notifications, and Profiles have been fully migrated to Neon/Drizzle.
-   **Modular Component Structure**: Frontend components are organized by feature.
-   **State Management**: React Context for global state and React Query for server state.
-   **RESTful API**: Backend exposes RESTful endpoints, organized by feature.
-   **ORM-driven Database Layer**: Drizzle ORM ensures type safety and a schema-first approach.
-   **Responsive Design**: Mobile-first approach with responsive UI components and bottom navigation.
-   **Authentication Flow**: Supabase handles user authentication, profile synchronization with PostgreSQL, and protected routes, including guest browsing and session management.
-   **Scalable Features**: Designed for real-time messaging (Socket.io), robust listing management, advanced search with AI recommendations, fraud detection, comprehensive refund and commission tracking, and extensive social features.
-   **Admin & Moderation**: Dedicated admin panel with logging, user reporting, abuse protection, monitoring, and a comprehensive provider application review system. An admin dashboard provides metrics, user management, orders, analytics, and settings, with login tracking for active user metrics. Admin Console at /admin/console with 4 tabs: Reports (resolve with dismiss/warn/remove/ban + confirm modal), Blocks (lookup by userId + admin unblock), Media (orphan scan with storage check + sweep), Rate Limits (live stats per route). All admin routes gated by requireAdmin middleware with [PROOF:ADMIN:GATE] logging.
-   **Safety Enforcement**: Block enforcement (isBlocked helper) prevents all interactions (follow, message, comment, like) between blocked users with 403 BLOCKED responses. Report system with 24h dedupe per reason, convenience endpoints (/api/reports/user, /post, /listing), and client useReport hook. Per-user rate limits: messages 10/min, comments 15/min, follows 20/min with 429 RATE_LIMIT responses. Media upload pipeline via useMediaUpload with retry, progress, and cascade delete on parent deletion.
-   **Compliance**: GDPR and privacy compliance features including data export, account deletion, and a legal compliance system with detailed Terms of Service, Privacy Policy, and user consent tracking.
-   **Stripe Connect Integration**: Manages monetization, subscriptions, and commission tracking, with Stripe account data synced across provider and profile tables.
-   **UI/UX Decisions**: A comprehensive Tailwind design token system ensures consistent color palette (blue-themed), typography, spacing, and animations. The search experience is Instagram-style with advanced keyboard navigation. All yellow/amber/orange colors have been purged for a consistent blue and white theme. Pill tab styling is used for navigation elements. Guest and authenticated users have feature parity for explore functionality.
-   **Technical Implementations**: Performance issues addressed with `useMemo`, `useCallback`, and query key serialization. Navigation stability ensured by fixing React Hooks order violations and implementing navigation guard logic. Non-blocking fallback UIs prevent hangs during data fetching. Instagram-style search features a consolidated StickyHeader.

## External Dependencies

-   **@neondatabase/serverless**: PostgreSQL connection pooling.
-   **@supabase/supabase-js**: Supabase client for auth and storage.
-   **drizzle-orm**: ORM for PostgreSQL.
-   **@tanstack/react-query**: Server state management.
-   **@radix-ui/**: Accessible UI primitives.
-   **tailwindcss**: Utility-first CSS framework.
-   **class-variance-authority**: Component variant management.
-   **lucide-react**: Icon library.
-   **tsx**: TypeScript execution.
-   **esbuild**: Fast JavaScript bundler.
-   **vite**: Development server and build tool.
-   **Sentry**: Error tracking.
-   **SendGrid**: Email service.
-   **Google Analytics 4**: Analytics tracking.
-   **OpenAI API**: AI-powered content moderation.