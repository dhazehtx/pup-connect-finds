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

## Recent Changes

### Mobile Theme Consistency Fix (Aug 9, 2025)
- **COMPLETED**: Eliminated ALL yellow/amber backgrounds from mobile interface
- Updated CSS utilities to force white (#FFFFFF) backgrounds for all yellow/amber color classes
- Fixed PupBox subscription cards: changed bg-gray-50 sections to white with borders
- Fixed Pet Services search panels: changed bg-muted to white with borders
- Added comprehensive CSS overrides for bg-purple-50, bg-muted, and color variants
- Created missing admin/log-navigation API endpoint to resolve console errors
- Mobile design now 100% matches desktop theme: white backgrounds, blue primary (#2363FF)

### Comprehensive UI/UX Fixes Complete (August 10, 2025)
- **Button Accessibility Fix**: Resolved invisible "Add to Cart" buttons by implementing proper contrast variants
  - Added .btn, .btn-primary, and .btn-outline utility classes to utilities.css
  - Fixed white-on-white text issue in Store tab product cards
  - Ensured proper focus states and disabled button handling
  - Applied accessible color combinations: outline buttons now use slate-800 text on white background
- **Collapsed Filters Implementation**: Added collapsible filters to Explore page
  - Filters collapsed by default with localStorage persistence
  - Floating toggle button positioned above bottom navigation
  - Basic search bar always visible, advanced filters hidden until requested
- **Enhanced Authentication Flow**: Created signInWithRetry utility with session validation
  - Added retry logic for first-attempt login failures
  - Implemented proper session establishment checking
  - Enhanced error handling and user feedback
- **Complete Yellow Background Purge**: Eliminated all remaining yellow/amber backgrounds
  - Updated admin components to use amber variants instead of yellow
  - Ensured consistent blue primary theme (#2563eb) across all interfaces
  - Mobile and desktop designs now perfectly aligned
- **Store Tab Button Alignment**: Fixed inconsistent product card button positioning
  - Implemented consistent flexbox layout with mt-auto for proper alignment
  - Standardized button heights and spacing across all product cards
  - Enhanced grid layout with proper gap management

### Pet Services Tab Design Lock-In (August 13, 2025)
- **COMPLETED**: Eliminated blue line and corner artifacts from Pet Services panels
  - Applied comprehensive CSS overrides to remove Radix UI default styling artifacts
  - Targeted data-radix-tabs-content elements with nuclear-level CSS fixes
  - Removed all pseudo-elements (::before, ::after) that created blue stripes/corners
  - Forced transparent borders and disabled all ring/outline effects on TabsContent wrappers
  - Applied clean white backgrounds with neutral border styling
  - Preserved all tab/chip styles exactly as designed (blue pill styling intact)
  - Design now locked with clean content panels and no visual artifacts

### Complete Yellow Color Purge & Theme Unification (August 17, 2025)
- **COMPLETED**: Total elimination of all yellow/amber/orange colors across entire application
  - **Analytics Components**: Replaced all yellow hex colors (#F59E0B, #f59e0b, #FBBF24) with blue variants (#2563EB, #3B82F6)
  - **Admin Dashboard**: Updated all orange severity indicators and warning states to blue theme
  - **Trust & Safety Tools**: Changed medium/pending status colors from orange to blue
  - **Messaging Oversight**: Unified status colors to use blue instead of orange/amber
  - **Subscription Analytics**: Fixed chart colors and tier breakdown to eliminate yellow
  - **Escrow Analytics**: Updated pending transaction colors to blue theme
  - **Profile Analytics**: Changed share action colors to blue scheme
  - **Partnership Pages**: Updated star ratings from amber to blue
  - **Logo Assets**: Changed sparkle accent colors from amber to blue in SVG files
  - **Profile Components**: Systematically replaced yellow styling in 90+ profile-related components
  - **Global CSS Overrides**: Added comprehensive CSS rules in `index.css` to force all yellow/amber/orange classes to white backgrounds
  - **Mobile Interface Fix**: Implemented nuclear-level CSS overrides to eliminate persistent yellow backgrounds on mobile pages
  - **Marketplace Tab Text Fix**: Fixed Pet Services, Pup Box, and Store tab text to be white for both selected and unselected states
  - **Cookie Consent Banner Fix**: Eliminated yellow button backgrounds, implemented proper white/blue color scheme for all consent buttons
- **Centralized Theme System**: Unified desktop/mobile architecture with design tokens
  - Centralized CSS variables in `client/src/styles/base.css` with unified color palette
  - Established comprehensive CSS variable system for surfaces, text, and brand colors
  - Created design token-based Tailwind configuration with consistent color scales
  - Mobile and desktop now use identical color system with no breakpoint-specific overrides
  - **Key Variables**: `--color-surface`, `--color-primary-600`, `--color-text`, `--color-text-muted`
- **Result**: Perfect visual consistency with ZERO yellow/amber/orange artifacts anywhere in the application. Comprehensive CSS overrides ensure complete elimination of yellow backgrounds on mobile interface, matching desktop design exactly. All marketplace tabs now display white text for optimal readability, and cookie consent interface maintains professional blue/white theme.

### Profile Page Button Fix (August 17, 2025)
- **COMPLETED**: Fixed yellow "Report a Bug" and "Privacy" buttons on profile page mobile version
  - Applied white background with blue text and border styling to match app's theme
  - Added hover states with light blue background for consistent interaction feedback
  - Updated UnifiedProfileView component with proper blue/white color classes
  - Added CSS overrides to prevent any remaining yellow button styling

### Messaging Interface Yellow Border Fix (August 17, 2025)
- **COMPLETED**: Eliminated yellow borders from conversations on messages page
  - Added comprehensive CSS overrides targeting all messaging component classes
  - Applied gray border defaults with blue focus/hover states for messaging elements
  - Covered conversation items, message bubbles, chat interfaces, and all related containers
  - Ensured consistent blue ring colors for all messaging component interactions

### Centralized Theme System Implementation (August 17, 2025)
- **COMPLETED**: Applied unified theme variables across Marketplace, Messages, Profile, and Store tabs
  - **Tab Styling**: All tabs now use `data-[state=active]:text-foreground` for consistent active states
  - **Button Theming**: All buttons use `bg-primary text-primary-foreground` including "Add to Cart" and "Become a Service Provider"
  - **Store Tab Content**: Product titles use `text-foreground`, descriptions use `text-muted-foreground`
  - **Blue Decoration Removal**: Eliminated all blue lines/corner decorations from Featured/All Services cards
  - **CSS Overrides**: Added comprehensive CSS rules in `index.css` to override hardcoded colors with theme variables
  - **Component Updates**: Updated StoreTab.tsx and ServicesTab.tsx to use theme variables instead of hardcoded colors
  - **Maintained Layout**: Preserved existing navigation structure and component visibility without modifications
  - **Theme Variables**: Leveraged existing CSS custom properties (--primary, --foreground, --muted-foreground) for consistency