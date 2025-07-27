# Insurance Claims Processing Application

A modern, dual-interface vehicle damage assessment system built with React, Node.js, and PostgreSQL. Features AI-powered damage analysis, automated cost estimation, and streamlined workflows for both policyholders and adjusters.

## Features

### 🚗 Policyholder Interface (Mobile-First)
- **Multi-step claim submission** with guided workflow
- **Photo upload** with camera integration and drag-and-drop
- **Real-time progress tracking** and form validation
- **Mobile-optimized design** for on-the-go claim filing
- **Intuitive damage description** with helpful prompts

### 👨‍💼 Adjuster Dashboard (Desktop)
- **Professional claim review interface** with comprehensive data display
- **AI-powered damage analysis** with severity classification
- **Interactive photo viewer** with detailed assessment overlays
- **Automated cost breakdown** by repair category
- **Action buttons** for claim management (approve, request info, schedule inspection)
- **Notes system** for adjuster documentation

### 🤖 AI-Powered Analysis
- **Damage severity detection** (minor, moderate, severe)
- **Confidence scoring** for reliability assessment
- **Repair type identification** (bodywork, paint, parts replacement)
- **Automated cost estimation** with breakdown by category
- **Real-time image processing** and analysis

## Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and optimized builds
- **Tailwind CSS** + **Shadcn/ui** for modern, accessible UI components
- **React Hook Form** + **Zod** for type-safe form validation
- **TanStack Query** for efficient server state management
- **Wouter** for lightweight client-side routing

### Backend
- **Node.js** + **Express.js** with TypeScript
- **PostgreSQL** database with **Drizzle ORM**
- **Multer** for file upload handling
- **Sharp** for image processing and optimization
- **RESTful API** design with proper error handling

### Development Tools
- **ESBuild** for fast TypeScript compilation
- **Drizzle Kit** for database migrations
- **TypeScript** for end-to-end type safety

## Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- npm or yarn package manager

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/YOUR_USERNAME/DamageVision.git
cd DamageVision
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
Create a `.env` file with:
```bash
DATABASE_URL=postgresql://user:password@localhost:5432/claims_db
NODE_ENV=development
```

4. **Initialize the database**
```bash
npm run db:push
```

5. **Start the development server**
```bash
npm run dev
```

The application will be available at `http://localhost:5000`

## Usage

### Filing a Claim (Policyholder)
1. Navigate to the root URL (`/`)
2. **Step 1**: Upload photos of vehicle damage using camera or file upload
3. **Step 2**: Describe the damage in detail
4. **Step 3**: Fill out incident information (date, location, vehicle details)
5. Submit the claim for processing

### Reviewing Claims (Adjuster)
1. Navigate to `/adjuster` for the dashboard
2. View submitted claims with AI analysis results
3. Review damage photos with severity classifications
4. Examine automated cost breakdowns
5. Take actions (approve, request info, schedule inspection)
6. Add adjuster notes for documentation

## API Endpoints

### Claims
- `GET /api/claims` - List all claims
- `GET /api/claims/:id` - Get specific claim
- `POST /api/claims` - Create new claim
- `PATCH /api/claims/:id` - Update claim

### Photos
- `GET /api/claims/:id/photos` - Get photos for claim
- `POST /api/claims/:id/photos` - Upload photos
- `DELETE /api/photos/:id` - Delete photo
- `GET /api/files/:filename` - Serve uploaded files

### Cost Analysis
- `GET /api/claims/:id/cost-breakdown` - Get cost breakdown

## Database Schema

### Claims Table
- Basic claim information (policyholder, vehicle, incident details)
- Status tracking and priority levels
- AI-generated cost estimates

### Damage Photos Table
- File metadata and storage information
- AI analysis results (severity, damage type)
- Confidence scores and repair recommendations

### Cost Breakdowns Table
- Detailed repair cost estimates by category
- Labor, parts, bodywork, and paint costs
- Confidence levels for estimates

## Project Structure

```
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Route-specific page components
│   │   ├── lib/           # Utility functions and API client
│   │   └── hooks/         # Custom React hooks
├── server/                # Backend Express application
│   ├── index.ts          # Server entry point
│   ├── routes.ts         # API route definitions
│   ├── storage.ts        # Database operations
│   └── db.ts            # Database connection
├── shared/               # Shared TypeScript types and schemas
│   └── schema.ts        # Drizzle ORM schema definitions
└── uploads/             # File upload storage (local development)
```

## Development Features

- **Hot Module Replacement** for instant development feedback
- **Type-safe database operations** with Drizzle ORM
- **Automatic schema synchronization** with database
- **Comprehensive error handling** and validation
- **Mobile-responsive design** across all interfaces

## Deployment

### Environment Variables
```bash
DATABASE_URL=your_production_database_url
NODE_ENV=production
```

### Build Commands
```bash
npm run build    # Build both frontend and backend
npm run start    # Start production server
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support and questions, please open an issue in the GitHub repository.

---

Built with ❤️ for modern insurance claim processing