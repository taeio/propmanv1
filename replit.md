# PropMan - Property Management Dashboard

## Overview

PropMan is a Next.js-based property management application designed to help property managers track clients, projects, notes, and financial information. The application provides a dashboard interface for managing rental properties, tracking rent payments, and overseeing external construction/maintenance projects. Built with React 18, TypeScript, and modern UI libraries, it offers a responsive design that works across desktop and mobile devices.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes (November 2025)

**Phase 1: Database & Authentication Foundation**
- Added PostgreSQL database with Drizzle ORM for future multi-tenant architecture
- Implemented Replit OAuth authentication system via Passport.js
- Created authentication API routes (/api/auth/login, /api/auth/logout, /api/auth/callback, /api/auth/user)
- Added useAuth hook for frontend authentication state
- **Important**: localStorage remains the primary data source - database is foundation for future features
- All existing UI functionality preserved and working identically

## System Architecture

### Frontend Architecture

**Framework Choice: Next.js 14 (Pages Router)**
- **Problem**: Need for a full-stack React framework with SSR capabilities and good developer experience
- **Solution**: Next.js 14 using the Pages Router pattern
- **Rationale**: Provides built-in routing, API routes, and TypeScript support. The Pages Router was chosen over App Router for simpler mental model and stable API
- **Trade-offs**: Pages Router is the older pattern; App Router offers newer features but requires different patterns

**State Management: Zustand with Persistence**
- **Problem**: Need to manage application state (clients, projects, notes) across components and persist data between sessions
- **Solution**: Zustand store with localStorage persistence middleware
- **Key Implementation**: Single global store (`useAppStore`) managing all entities with CRUD operations
- **Benefits**: Lightweight (~1KB), simple API, automatic localStorage sync
- **Storage Key**: `taeio-dashboard-storage`

**UI Library Stack**
- **Styling**: Tailwind CSS for utility-first styling with custom color scheme (columbia red: #E63946)
- **Animations**: Framer Motion for sidebar transitions and page animations
- **Icons**: Lucide React for consistent iconography
- **Responsive Design**: Mobile-first approach with collapsible sidebar (hamburger menu on mobile, persistent on desktop)

**Component Architecture**
- **Layout Pattern**: Centralized Layout component wrapping all pages via `_app.tsx`
- **Dynamic Imports**: Sidebar and Topbar use `dynamic()` with `ssr: false` to prevent hydration mismatches
- **Client Components**: All interactive components marked with `"use client"` directive
- **Hydration Strategy**: Dashboard implements delayed hydration with loading state to handle localStorage data

### Data Model

**Entity Schemas**

1. **Projects**
   - Tracks external construction/maintenance work
   - Fields: id, name, externalClient, budget, amountPaid, status
   - Status Types: "In Progress" | "Completed" | "Pending"

2. **Clients**
   - Tracks rental tenants and rent payments
   - Fields: id, firstName, lastName, unitNumber, rentAmount, status
   - Status Types: "Paid" | "Late" | "Due"

3. **Notes**
   - General note-taking with categorization
   - Fields: id, text, category
   - Categories: "client" | "project" | "finance" | "maintenance"

**Data Persistence**
- **Current Storage**: Browser localStorage via Zustand persist middleware
- **Persistence Mechanism**: Automatic serialization with storage key `taeio-dashboard-storage`
- **Hydration**: Manual localStorage read on dashboard mount to prevent SSR/CSR mismatches
- **Future Storage**: PostgreSQL database with Drizzle ORM (foundation in place, not yet used for main data)

### Routing Structure

**Pages**
- `/` - Dashboard with overview statistics and recent clients
- `/clients` - Client management (CRUD operations)
- `/projects` - Project management (CRUD operations)
- `/notes` - Note-taking interface
- `/settings` - User preferences and configuration

**API Routes**
- `/api/hello` - Example API route (placeholder)
- `/api/auth/login` - Initiates Replit OAuth flow
- `/api/auth/callback` - OAuth callback handler
- `/api/auth/logout` - Logs out and clears session
- `/api/auth/user` - Returns current authenticated user (or 401 if not logged in)

**Navigation**
- Sidebar navigation with icons (Home, Users, ClipboardList, Settings)
- Mobile: Collapsible sidebar with overlay
- Desktop: Persistent sidebar

### Styling Architecture

**Tailwind Configuration**
- Custom color palette with `columbia` red brand color
- Responsive breakpoints using default Tailwind (md: 768px)
- Content paths: `/src/pages/**`, `/src/components/**`, `/src/app/**`
- Custom silver color (#C0C0C0) for UI accents

**Design Patterns**
- Rounded cards with shadows (`rounded-2xl shadow-md`)
- Consistent spacing using Tailwind's spacing scale
- Status badges with color coding (green for Paid, red for Late/Due, blue for Due)
- Modal overlays for create/edit operations

### Performance Optimizations

**Code Splitting**
- Dynamic imports for client-only components (Sidebar, Topbar)
- Next.js automatic code splitting per page

**Rendering Strategy**
- SSR disabled for interactive components to prevent hydration errors
- Client-side state management with Zustand for fast interactions
- No external API calls (all data in localStorage)

**TypeScript Configuration**
- Strict mode enabled for type safety
- Path aliases (`@/*` maps to `./src/*`)
- Target: ES2017 for broad browser compatibility

## External Dependencies

### Core Framework
- **Next.js 14.2.33**: React framework for production
- **React 18.3.1**: UI library
- **TypeScript 5.4.5**: Static typing

### State & Data Management
- **Zustand 5.0.8**: Lightweight state management with persistence
- **Storage (Current)**: Browser localStorage via Zustand
- **Drizzle ORM 0.38.3**: TypeScript ORM for PostgreSQL (foundation layer)
- **PostgreSQL**: Replit-hosted Neon database (for sessions and future multi-tenant data)

### UI & Styling
- **Tailwind CSS 3.4.3**: Utility-first CSS framework
- **PostCSS 8.4.31**: CSS processing
- **Autoprefixer 10.4.21**: CSS vendor prefixing
- **Framer Motion 12.23.24**: Animation library
- **Lucide React 0.548.0**: Icon library

### Authentication & Backend
- **Passport.js**: OAuth authentication middleware
- **passport-openidconnect**: Replit OAuth strategy
- **express-session**: Session management
- **connect-pg-simple**: PostgreSQL session store
- **pg**: PostgreSQL client library

### Development Tools
- **ESLint 9.39.1**: Code linting with Next.js configuration
- **Drizzle Kit**: Database migrations and schema management
- **@types/node, @types/react, @types/passport, @types/pg**: TypeScript definitions

### Runtime Configuration
- **Dev Server**: Port 5000, bound to 0.0.0.0 (all interfaces)
- **Production**: Same port configuration for consistency
- **React Strict Mode**: Enabled for development warnings

### Backend Architecture (Phase 1 Foundation - November 2025)

**Database Layer**
- **Schema Location**: `shared/schema.ts` defines all Drizzle models
- **Connection**: `server/db.ts` manages PostgreSQL connection pool
- **Storage Interface**: `server/storage.ts` provides data access methods
- **Tables Created**:
  - `users` - Authenticated user profiles (id, username, createdAt)
  - `sessions` - Express session storage for Passport.js
  - `projects` - Future multi-tenant project data (not yet used)
  - `clients` - Future multi-tenant client data (not yet used)
  - `notes` - Future multi-tenant notes (not yet used)

**Authentication System**
- **Provider**: Replit OAuth via `openid-client`
- **Strategy**: Passport.js with OpenID Connect
- **Session Store**: PostgreSQL via `connect-pg-simple`
- **Configuration**: `server/replitAuth.ts` handles auth setup
- **Middleware**: `src/lib/authMiddleware.ts` provides API route helpers
- **Frontend Hook**: `src/hooks/useAuth.ts` manages auth state

**Migration Strategy**
- Database migrations run via `npm run db:push` (Drizzle Kit)
- Schema changes pushed directly to database
- Use `--force` flag if data-loss warnings appear

### Current State & Roadmap

**What Works Now (Phase 2 In Progress - Final Fixes Needed)**
✅ Database foundation with PostgreSQL + Drizzle ORM with auto-incrementing IDs  
✅ Authentication system with Replit OAuth  
✅ Session management in database  
✅ Login/Logout button in Topbar UI  
✅ Multi-tenant API routes for clients, projects, notes (GET/POST/PUT/DELETE)  
✅ Hybrid Zustand store: localStorage offline, database when authenticated  
✅ Smart migration: Only uploads unsynced items (no duplicates)  
✅ Offline edits marked unsynced: Updates set `_synced: false`, deletes add `_deleted: true`
⚠️ **Migration needs final fix**: Handle PUT for updates and DELETE for marked items

**What Needs Completion (Next 5 minutes)**
- Update `migrateLocalDataToDatabase` to:
  1. Send PUT requests for items with `_synced: false` and existing DB ID
  2. Send DELETE requests for items with `_deleted: true`  
  3. Send POST requests for truly new items (no ID)

**Architecture Notes**
- Offline mode: localStorage, items have no `_synced` flag
- Login: Migrate unsynced → Sync from DB → All marked `_synced: true`
- Authenticated: CRUD via API, responses marked `_synced: true`
- Logout: Keep current state (latest DB sync)
- Offline edits/deletes: Marked `_synced: false` / `_deleted: true`
- Next login: Migration handles updates/deletes/creates properly