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
    - **Pages**: `/`, `/clients`, `/projects`, `/notes`, `/finance`, `/settings`, `/tenant`.
    - **API Routes**: `/api/auth/*` for authentication, `/api/user/profile` for user management, `/api/data/*` for multi-tenant CRUD operations (clients, projects, notes, payments), and `/api/stripe/*` for secure payment processing.

### Backend Architecture
- **Database**: PostgreSQL with Drizzle ORM for multi-tenant data storage and session management.
- **Authentication**: Custom username/password authentication via Passport.js LocalStrategy with scrypt password hashing and PostgreSQL session store.
- **Multi-tenancy**: All data (clients, projects, notes, payments) is isolated per user via `userId` foreign keys.
- **Data Synchronization**: A hybrid approach where data is managed in localStorage when offline/logged out, and seamlessly synchronized with the PostgreSQL database when authenticated. Offline changes (creates, updates, deletes) are tracked and reconciled upon re-authentication.
- **Performance Optimization**: Database indexes on all userId fields (projects, clients, notes, payments) for fast multi-tenant filtering, plus (projectId, deletedAt) composite index on maintenance issues for efficient soft-delete queries and (issueId) index on comments for fast thread loading.
- **Input Validation**: Comprehensive Zod schemas validate all API inputs with type-safe request handling via custom middleware (validateBody, requireAuth, requireRole, compose).
- **Rate Limiting**: Comprehensive API throttling with tiered limits per endpoint type (authentication: 10 requests/15 minutes, data operations: 100 GET/30 POST per minute, payments: 10 requests/5 minutes). In-memory store suitable for single-instance deployments with X-RateLimit headers on all responses and automatic 429 responses when limits exceeded.
- **Security**: Role-based access control on all protected routes, server-side validation prevents unauthorized access, password hashing with scrypt, session management via PostgreSQL, comprehensive rate limiting across all endpoints.

### Data Model
- **Projects**: `id`, `name`, `externalClient`, `budget`, `amountPaid`, `status`.
- **Clients**: `id`, `firstName`, `lastName`, `unitNumber`, `rentAmount`, `status`.
- **Notes**: `id`, `text`, `category`.
- **Payments**: `id`, `clientId`, `amount`, `paymentDate`, `notes`, `userId` (multi-tenant).
- **Users**: `id`, `username`, `firstName`, `lastName`, `email`, `role`, `themePreference`, `clientId` (links tenants to their client record), `stripeConnectedAccountId` (Stripe Connect account for property managers), `createdAt`.
- **Maintenance Issues**: `id`, `projectId`, `title`, `description`, `status`, `priority`, `category`, `createdBy`, `assignedTo`, `dueDate`.
- **Maintenance Comments**: `id`, `issueId`, `userId`, `comment`, `createdAt`.

### Financial Dashboard Features
- **Metrics**: Total Rent Collected, Outstanding Balance, Project Budget Tracking.
- **Visualizations**: Monthly Revenue Trend Chart (Recharts LineChart).
- **Payment Recording**: Quick payment modal from client cards with automatic status updates.
- **Reporting**: CSV export for financial reports.

### Settings Page Features
- **User Profile Management**: Editable `firstName`, `lastName`, `email` with database persistence.
- **Theme Toggle**: Light/dark mode support persisted in localStorage and database.
- **Authentication Gate**: Prompts for login if unauthenticated, enables editing when logged in.

### Maintenance Issue Tracking Features
- **Multi-Role Communication**: Enables tenants, property managers/assistants, and maintenance workers to communicate on project maintenance issues.
- **Issue Management**: Create, view, and track maintenance issues per project with status tracking (open, in_progress, resolved, closed).
- **Status Updates**: Dropdown in issue detail modal allows changing issue status (Open → In Progress → Resolved → Closed) with immediate UI updates and database persistence.
- **Soft-Delete System**: Issues marked as "resolved" or "closed" are soft-deleted using `deletedAt` timestamp, disappearing from all user views while being retained in the database for compliance and audit purposes.
- **Priority System**: Four priority levels (low, medium, high, urgent) with color-coded badges.
- **Automatic Priority Assignment**: Tenant-submitted maintenance requests automatically receive priority based on message content analysis (urgent keywords like "emergency", "flooding" assign urgent priority; safety/essential service keywords assign high priority; etc.).
- **Category Organization**: Six predefined categories (plumbing, electrical, HVAC, appliance, structural, other).
- **Comments Thread**: Real-time comment system for multi-party communication on each issue.
- **Issue Badges**: Visual indicators on project cards showing count of open/in-progress issues.
- **Modal-Based UI**: Three-modal workflow (issue list, add issue, issue detail with comments).
- **Assignment Tracking**: Support for assigning issues to specific users with optional due dates.
- **Full Dark Mode**: Complete dark mode support across all maintenance modals and components.
- **Dashboard Integration**: Active maintenance issues (open/in_progress) appear on the dashboard sorted by priority (urgent → high → medium → low), showing project name, issue title, priority badge, category, and status. Clicking any issue navigates to the Projects page and automatically opens that project's maintenance modal.
- **Maintenance Tab**: Projects page includes dedicated maintenance tab showing all active maintenance issues across all projects with filtering to exclude soft-deleted items.

### Stripe Connect Integration
- **Property Manager Onboarding**: Property managers can connect their own Stripe accounts via Stripe Connect Express onboarding flow directly from Settings page.
- **Multi-Tenant Payment Routing**: Rent payments from tenants are automatically routed to the property manager's connected Stripe account using `transfer_data`.
- **Platform Fee**: Configurable platform fee (default 3%) via `STRIPE_PLATFORM_FEE_PERCENT` environment variable, collected on each rent payment.
- **Account Validation**: Payment intents are only created when property manager's Stripe account has `charges_enabled` and `payouts_enabled` flags set.
- **Connection Status Display**: Settings page shows real-time Stripe account status including details submitted, charges enabled, and payouts enabled.
- **Security**: Server-side validation ensures rent amounts are derived from database (not client), payment intents are verified with Stripe before recording, and connected account IDs are validated with `acct_` prefix.
- **Error Handling**: Clear user-facing error messages when property managers haven't connected Stripe or haven't completed onboarding.
- **Webhook Integration**: Real-time payment event processing via `/api/stripe/webhooks` endpoint with signature verification
  - Handles `payment_intent.succeeded` - automatically records successful payments
  - Handles `payment_intent.payment_failed` - tracks failed payment attempts
  - Handles `charge.refunded` - updates payment status when refunds occur
  - Handles `charge.dispute.created` - marks payments as disputed for investigation
- **Payment Status Tracking**: Database stores payment status (succeeded, failed, refunded, disputed) and Stripe payment intent IDs for reconciliation
- **API Endpoints**: 
  - `/api/stripe/connect/create-account-link` - Creates Stripe onboarding links
  - `/api/stripe/connect/status` - Retrieves connected account status
  - `/api/stripe/create-payment-intent` - Creates payment intents with Connect routing
  - `/api/stripe/record-payment` - Records payments after Stripe verification
  - `/api/stripe/webhooks` - Handles real-time Stripe events

### Tenant Dashboard (`/tenant`)
- **Separate Interface**: Dedicated tenant-facing dashboard with distinct UI design (indigo color scheme vs. property manager's red/silver).
- **Limited Functionality**: Tenants only have access to rent payments, maintenance requests, and settings (no access to projects, clients, finance, or notes).
- **No Navigation Sidebar**: Tenants do not see the standard sidebar/topbar navigation - they have a simplified interface.
- **Simplified Request Form**: Maintenance request form without manual priority selection - priority is automatically assigned based on issue description.
- **Request Tracking**: View all submitted maintenance requests with status updates and comments from property managers.
- **Settings Integration**: Full access to profile settings (name, email) and theme preferences.
- **Real-time Updates**: View status changes and comments on maintenance requests in real-time.
- **Online Rent Payment**: Secure Stripe integration for PCI-compliant credit card payments that route directly to property manager's connected Stripe account, with server-side validation, payment verification, and automatic payment recording.

### Authentication & Authorization
- **Role-Based Access Control**: Users are assigned roles ("property_manager" or "tenant") during signup that determine dashboard access.
- **Route Protection**: All pages protected via HOC that validates authentication and role permissions.
- **Navigation Visibility**: Sidebar/topbar only visible to authenticated property managers - hidden for unauthenticated users and tenants.
- **Authentication Page**: Modern design with professional background image, backdrop blur effects, gradient elements, and responsive layout.
- **Role Selection**: Clear role selector during signup with descriptions for property managers vs. tenants.
- **Automatic Routing**: Users automatically redirected to role-appropriate dashboard after login (property managers to `/`, tenants to `/tenant`).

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

### Payment Processing
- **Stripe 19.3.0** (server-side payment processing with Connect)
- **@stripe/stripe-js** (client-side Stripe integration)
- **@stripe/react-stripe-js** (React components for Stripe Elements)

### Development Tools
- **ESLint 9.39.1**
- **Drizzle Kit**