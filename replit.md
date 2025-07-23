# MY PUP - Dog Listing Platform

## Overview

MY PUP is a comprehensive dog listing platform that connects dog lovers with breeders, rescues, and individual sellers. The application provides a marketplace for buying and selling dogs, with integrated messaging, educational resources, and safety features. Built as a full-stack web application with React frontend and Express backend, utilizing PostgreSQL for data persistence and Supabase for authentication and real-time features.

## User Preferences

Preferred communication style: Simple, everyday language.

**Important: Preserve all existing Supabase functionality**
- Keep all Supabase client calls, authentication, and storage intact
- Do not remove or replace any existing Supabase integration
- Supabase remains the primary backend service for this application

## System Architecture

The application follows a full-stack architecture with clear separation between frontend and backend components:

**Frontend**: React 18 with TypeScript, using Vite for build tooling and development server
**Backend**: Express.js server with TypeScript 
**Database**: PostgreSQL with Drizzle ORM for type-safe database operations
**Authentication**: Supabase Auth for user management and session handling
**Real-time Features**: Supabase real-time subscriptions for live messaging and notifications
**Styling**: Tailwind CSS with shadcn/ui component library for consistent design system

## Key Components

### Frontend Architecture
- **Component Structure**: Modular React components organized by feature (messaging, listings, profiles, education)
- **State Management**: React Context for global state (Auth, Theme, Realtime), React Query for server state management
- **Routing**: React Router for client-side navigation with protected routes
- **UI Framework**: shadcn/ui components built on Radix UI primitives with Tailwind styling
- **Mobile Optimization**: Responsive design with mobile-first approach and bottom navigation

### Backend Architecture
- **API Structure**: RESTful Express.js server with route handlers organized by feature
- **Database Layer**: Drizzle ORM with schema-first approach for type safety
- **Storage Interface**: Abstracted storage layer for database operations
- **Development Server**: Vite integration for hot module replacement in development

### Database Schema
The schema includes comprehensive tables for:
- **Profiles**: User accounts with breeder/buyer distinctions
- **Dog Listings**: Detailed pet information with images, health records, and pricing
- **Messaging System**: Conversations and messages between users
- **Reviews & Ratings**: User feedback and reputation system
- **Favorites & Notifications**: User engagement tracking
- **Transactions**: Payment and purchase history

### Authentication & Authorization - 95% Complete
- **Supabase Integration**: Handles user registration, login, and session management
- **Guest Mode**: Allows anonymous browsing with prompts for account creation
- **Profile Management**: Automatic profile creation and synchronization with auth users
- **Protected Routes**: Route-level protection for authenticated features
- **Session Management**: 30-minute inactivity timeout with 2-minute warning modal
- **Token Refresh**: Failsafe token validation every 15 minutes with automatic refresh
- **Security Features**: Activity monitoring, graceful logout, and comprehensive auth state handling

## Data Flow

1. **User Authentication**: Supabase handles auth, with profile sync to PostgreSQL
2. **Listing Management**: CRUD operations through Express API to PostgreSQL
3. **Real-time Messaging**: Supabase real-time for instant message delivery
4. **File Uploads**: Image and document uploads through Supabase storage
5. **Search & Filtering**: Advanced search with AI-powered recommendations
6. **Analytics Tracking**: User behavior and platform metrics collection

## External Dependencies

### Core Technologies
- **@neondatabase/serverless**: PostgreSQL connection pooling for serverless environments
- **@supabase/supabase-js**: Authentication, real-time features, and file storage
- **drizzle-orm**: Type-safe database operations and schema management
- **@tanstack/react-query**: Server state management and caching

### UI & Styling
- **@radix-ui/**: Accessible UI primitives for form controls and overlays
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Component variant management
- **lucide-react**: Icon library

### Development Tools
- **tsx**: TypeScript execution for development server
- **esbuild**: Fast bundling for production builds
- **vite**: Development server with HMR

## Deployment Strategy

### Development Environment
- **Development Server**: Vite dev server with Express backend integration
- **Hot Reloading**: Automatic code reloading for rapid development
- **Environment Variables**: Database URL and Supabase configuration

### Production Build
- **Frontend**: Vite build process generating optimized static assets
- **Backend**: esbuild compilation to ESM modules for Node.js deployment
- **Database**: Drizzle migrations for schema deployment to PostgreSQL
- **Asset Management**: Static file serving through Express in production

### Infrastructure Requirements
- **Database**: PostgreSQL instance (Neon, Supabase, or traditional hosting)
- **File Storage**: Supabase storage for images and documents
- **Environment**: Node.js runtime supporting ESM modules
- **SSL**: HTTPS required for Supabase integration and secure authentication

The application is designed for modern web deployment with consideration for serverless environments while maintaining the flexibility for traditional server hosting.

## Recent Updates

### Session Management & Token Refresh Enhancement (July 2025)
- Implemented comprehensive session timeout system with 30-minute inactivity logout
- Added 2-minute warning modal with countdown timer and session extension option
- Enhanced token refresh strategy with failsafe session checking every 15 minutes
- Integrated activity monitoring for mouse, keyboard, touch, and scroll events
- Created professional warning modal with progress indicator and security messaging
- Added comprehensive auth state listening for all Supabase authentication events
- Improved error handling and graceful logout with user notifications

### Fraud Detection System Implementation (July 2025)
- Developed comprehensive fraud detection middleware with risk scoring (0-100 scale)
- Created intelligent detection for IP mismatches, duplicate content, banned keywords, and rapid activity
- Implemented tiered response system: flagged (30+), under review (70+), suspended (90+)
- Built user-friendly fraud warning components including banners and modal alerts
- Added fraud detection demo interface accessible at /fraud-demo for testing scenarios
- Integrated with existing rate limiting system for multi-layered security protection
- Created modular detection logic for easy expansion of fraud prevention rules

### Comprehensive Refund System Implementation (July 2025)
- Built complete refund request system with Stripe API integration for secure payment processing
- Implemented eligibility checking with time-based rules and automatic approvals for qualifying requests
- Created comprehensive backend with RefundService class handling all refund operations
- Added tiered refund reasons: canceled orders, scam listings, disputes, service issues, duplicates
- Developed admin panel with approval/decline workflow and comprehensive refund statistics
- Built user-friendly frontend components: RefundRequestForm, RefundStatusCard, AdminRefundPanel
- Integrated automatic refund processing through Stripe with proper error handling and status tracking
- Added refund center interface accessible at /refund-center for complete refund management

### Commission Tracking System Implementation (July 2025)
- Built comprehensive commission tracking system with variable rates by listing type
- Implemented automated commission calculation: 10% puppy listings, 15% services, flat fee rehoming
- Created CommissionService with eligibility checking, payout tracking, and Stripe integration
- Added commission settings management with configurable rates, flat fees, and min/max caps
- Developed complete REST API for commission creation, tracking, and admin management
- Built user-friendly components: CommissionCalculator, SellerEarningsCard, AdminCommissionPanel
- Integrated with transaction system for automatic commission creation on successful payments
- Added commission center interface at /commission-center for sellers and admin management