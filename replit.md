# Replit.md - Insurance Claims Processing Application

## Overview

This is a full-stack insurance claims processing application built with React frontend and Express.js backend. The system allows policyholders to submit vehicle damage claims with photo uploads and enables adjusters to review, analyze, and process these claims. The application features AI-powered damage analysis, cost estimation, and a comprehensive workflow for claim management.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **UI Framework**: Shadcn/ui with Radix UI components and Tailwind CSS
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM (Database storage active)
- **File Uploads**: Multer for handling multipart form data
- **Image Processing**: Sharp for image optimization and format conversion
- **Session Management**: Express sessions with PostgreSQL storage

### Database Schema
- **Claims Table**: Stores claim information including policyholder details, incident data, and status
- **Damage Photos Table**: Stores uploaded photos with AI analysis results
- **Cost Breakdowns Table**: Stores repair cost estimations and breakdown by category

## Key Components

### Frontend Components
1. **Policyholder Interface** (`/pages/policyholder.tsx`)
   - Multi-step claim submission form
   - Photo upload with camera integration
   - Form validation and progress tracking

2. **Adjuster Interface** (`/pages/adjuster.tsx`)
   - Claim review and management dashboard
   - Photo analysis viewer with AI insights
   - Cost breakdown display and editing

3. **Photo Upload Component** (`/components/photo-upload.tsx`)
   - File drag-and-drop interface
   - Camera integration for mobile devices
   - Image preview and management

4. **Damage Analysis Component** (`/components/damage-analysis.tsx`)
   - AI analysis results display
   - Severity categorization and confidence scores
   - Interactive photo viewer

5. **Cost Breakdown Component** (`/components/cost-breakdown.tsx`)
   - Repair cost visualization
   - Category-based cost breakdown
   - Confidence level indicators

### Backend Components
1. **Routes Handler** (`/server/routes.ts`)
   - RESTful API endpoints for claims, photos, and cost breakdowns
   - File upload handling with validation
   - Mock AI analysis integration

2. **Storage Layer** (`/server/storage.ts`)
   - PostgreSQL database storage implementation with Drizzle ORM
   - Interface-based design with DatabaseStorage class
   - CRUD operations for all entities with proper type safety

3. **Database Schema** (`/shared/schema.ts`)
   - Drizzle ORM schema definitions
   - Zod validation schemas
   - Type-safe database operations

## Data Flow

1. **Claim Submission Flow**:
   - Policyholder fills out claim form with incident details
   - Photos are uploaded and processed (resized, format converted)
   - AI analysis is performed on uploaded images
   - Claim is stored with "submitted" status
   - Cost estimation is generated based on damage analysis

2. **Adjuster Review Flow**:
   - Adjuster accesses claim dashboard
   - Reviews claim details and uploaded photos
   - Examines AI analysis results and damage assessments
   - Updates claim status and adds adjuster notes
   - Modifies cost estimates if needed

3. **Photo Processing Pipeline**:
   - Original image upload and validation
   - Image optimization and format standardization
   - AI damage analysis (mocked with realistic data)
   - Storage of processed images and analysis results

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database connectivity
- **drizzle-orm**: Type-safe database ORM
- **@tanstack/react-query**: Server state management
- **react-hook-form**: Form handling and validation
- **zod**: Schema validation
- **multer**: File upload handling
- **sharp**: Image processing

### UI Dependencies
- **@radix-ui/***: Accessible UI component primitives
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Component variant management
- **lucide-react**: Icon library

### Development Dependencies
- **vite**: Build tool and development server
- **typescript**: Type checking
- **tsx**: TypeScript execution for Node.js

## Deployment Strategy

### Development Environment
- Vite dev server for frontend with HMR
- TSX for running TypeScript backend directly
- PostgreSQL database for persistent storage
- Replit integration with development banner and cartographer

### Production Build
- Frontend: Vite builds optimized static assets to `dist/public`
- Backend: ESBuild bundles server code to `dist/index.js`
- Database: Drizzle migrations applied via `drizzle-kit push`
- Assets: File uploads stored in local `uploads` directory

### Environment Configuration
- `DATABASE_URL` required for PostgreSQL connection
- `NODE_ENV` for environment-specific behavior
- Session configuration for production security
- File upload limits and validation rules

### Scaling Considerations
- PostgreSQL database provides persistent storage with ACID compliance
- File upload system can be extended to cloud storage (S3, etc.)
- AI analysis system designed for external service integration
- Component-based architecture supports feature additions and modifications

## Recent Changes

### Database Migration (January 2025)
- Migrated from in-memory storage to PostgreSQL database
- Implemented DatabaseStorage class with Drizzle ORM
- All claim, photo, and cost data now persists across server restarts
- Added proper database schema with foreign key relationships

### Documentation and Repository Setup (January 2025)
- Created comprehensive README.md with installation and usage instructions
- Updated .gitignore with proper exclusions for environment files and uploads
- Documented complete API endpoints and database schema
- Added project structure overview and deployment guidelines