# PropMan - Property Management Dashboard

## Overview
PropMan is a Next.js-based property management application designed to help property managers track clients, projects, notes, and financial information. It offers a dashboard interface for managing rental properties, tracking rent payments, and overseeing external construction/maintenance projects. Built with React 18, TypeScript, and modern UI libraries, it provides a responsive design across desktop and mobile devices. The project aims to deliver a production-ready, multi-tenant system with robust authentication, comprehensive financial tracking, and user preference management.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: Next.js 14 (Pages Router) for SSR capabilities and built-in routing.
- **State Management**: Zustand with localStorage persistence (`taeio-dashboard-storage`) for managing application state (clients, projects, notes, payments, user profile) with automatic offline/online data synchronization.
- **UI Library Stack**:
    - **Styling**: Tailwind CSS for utility-first styling with a custom color scheme (columbia red: #E63946, silver: #C0C0C0) and dark mode support.
    - **Animations**: Framer Motion for transitions.
    - **Icons**: Lucide React.
- **Responsive Design**: Mobile-first approach with a collapsible sidebar.
- **Component Architecture**: Centralized Layout, dynamic imports for performance, and client components for interactivity.
- **Routing**:
    - **Pages**: `/`, `/clients`, `/projects`, `/notes`, `/finance`, `/settings`.
    - **API Routes**: `/api/auth/*` for authentication, `/api/user/profile` for user management, and `/api/data/*` for multi-tenant CRUD operations (clients, projects, notes, payments).

### Backend Architecture
- **Database**: PostgreSQL with Drizzle ORM for multi-tenant data storage and session management.
- **Authentication**: Replit OAuth via Passport.js with OpenID Connect strategy and PostgreSQL session store.
- **Multi-tenancy**: All data (clients, projects, notes, payments) is isolated per user via `userId` foreign keys.
- **Data Synchronization**: A hybrid approach where data is managed in localStorage when offline/logged out, and seamlessly synchronized with the PostgreSQL database when authenticated. Offline changes (creates, updates, deletes) are tracked and reconciled upon re-authentication.

### Data Model
- **Projects**: `id`, `name`, `externalClient`, `budget`, `amountPaid`, `status`.
- **Clients**: `id`, `firstName`, `lastName`, `unitNumber`, `rentAmount`, `status`.
- **Notes**: `id`, `text`, `category`.
- **Payments**: `id`, `clientId`, `amount`, `paymentDate`, `notes`, `userId` (multi-tenant).
- **Users**: `id`, `username`, `firstName`, `lastName`, `email`, `themePreference`, `createdAt`.

### Financial Dashboard Features
- **Metrics**: Total Rent Collected, Outstanding Balance, Project Budget Tracking.
- **Visualizations**: Monthly Revenue Trend Chart (Recharts LineChart).
- **Payment Recording**: Quick payment modal from client cards with automatic status updates.
- **Reporting**: CSV export for financial reports.

### Settings Page Features
- **User Profile Management**: Editable `firstName`, `lastName`, `email` with database persistence.
- **Theme Toggle**: Light/dark mode support persisted in localStorage and database.
- **Authentication Gate**: Prompts for login if unauthenticated, enables editing when logged in.

## External Dependencies

### Core Framework & Language
- **Next.js 14.2.33**
- **React 18.3.1**
- **TypeScript 5.4.5**

### State & Data Management
- **Zustand 5.0.8** (with persistence middleware)
- **Drizzle ORM 0.38.3**
- **PostgreSQL** (Replit-hosted Neon database)

### UI & Styling
- **Tailwind CSS 3.4.3**
- **Framer Motion 12.23.24**
- **Lucide React 0.548.0**
- **Recharts** (for charts in finance dashboard)

### Authentication & Backend
- **Passport.js**
- **passport-openidconnect**
- **express-session**
- **connect-pg-simple**
- **pg**

### Development Tools
- **ESLint 9.39.1**
- **Drizzle Kit**