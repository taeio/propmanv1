# PropMan - Property Management Dashboard

## Overview

PropMan is a Next.js-based property management application designed to help property managers track clients, projects, notes, and financial information. The application provides a dashboard interface for managing rental properties, tracking rent payments, and overseeing external construction/maintenance projects. Built with React 18, TypeScript, and modern UI libraries, it offers a responsive design that works across desktop and mobile devices.

## User Preferences

Preferred communication style: Simple, everyday language.

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
- **Storage**: Browser localStorage (no backend database)
- **Persistence Mechanism**: Zustand persist middleware with automatic serialization
- **Hydration**: Manual localStorage read on dashboard mount to prevent SSR/CSR mismatches

### Routing Structure

**Pages**
- `/` - Dashboard with overview statistics and recent clients
- `/clients` - Client management (CRUD operations)
- `/projects` - Project management (CRUD operations)
- `/notes` - Note-taking interface
- `/settings` - User preferences and configuration
- `/api/hello` - Example API route (placeholder)

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
- **Storage**: Browser localStorage (no external database)

### UI & Styling
- **Tailwind CSS 3.4.3**: Utility-first CSS framework
- **PostCSS 8.4.31**: CSS processing
- **Autoprefixer 10.4.21**: CSS vendor prefixing
- **Framer Motion 12.23.24**: Animation library
- **Lucide React 0.548.0**: Icon library

### Development Tools
- **ESLint 9.39.1**: Code linting with Next.js configuration
- **@types/node, @types/react**: TypeScript definitions

### Runtime Configuration
- **Dev Server**: Port 5000, bound to 0.0.0.0 (all interfaces)
- **Production**: Same port configuration for consistency
- **React Strict Mode**: Enabled for development warnings

### Future Considerations
The application currently uses localStorage for data persistence. If backend functionality is needed in the future, consider:
- Adding a database (Postgres, MySQL, or MongoDB)
- Implementing an ORM (Drizzle, Prisma, or TypeORM)
- Creating API routes for CRUD operations
- Adding authentication/authorization (NextAuth, Clerk, or similar)
- Implementing real-time updates (WebSockets or polling)