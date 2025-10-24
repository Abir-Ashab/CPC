# Photo Contest Application - Frontend

A modern photo contest application with authentication, voting, and admin features built with Next.js 14 and Tailwind CSS.

## Features

- � Google OAuth authentication
- 📸 Photo upload with drag & drop support
- �️ Photo voting system (like/dislike)
- 👑 Admin panel for contest management
- � Real-time voting results
- 📱 Fully responsive design with Tailwind CSS
- 🎨 Modern UI with shadcn/ui components
- ⚡ Next.js 14 with App Router and TypeScript
- 🔄 React Query for efficient data fetching
- 🏪 Zustand for state management

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **State Management**: Zustand
- **Data Fetching**: React Query (@tanstack/react-query)
- **HTTP Client**: Axios with interceptors
- **Authentication**: JWT tokens with refresh
- **Icons**: Lucide React

## Quick Start

### Prerequisites

- Docker and Docker Compose installed
- Node.js 18+ (for local development)

### Running with Docker (Recommended)

1. Clone the repository and start all services:

```bash
docker-compose up --build
```

2. Access the application:
   - **Frontend**: <http://localhost:3000>
   - **Backend API**: <http://localhost:5000>
   - **MinIO Console**: <http://localhost:9001> (minioadmin/minioadmin)

### Local Development

1. Install dependencies:

```bash
npm install
```

2. Configure environment variables:

```bash
# Create .env.local file
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

3. Make sure the backend is running, then start the development server:

```bash
npm run dev
```

The frontend will be available at <http://localhost:3000>

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| NEXT_PUBLIC_API_URL | Backend API URL | http://localhost:5000/api |

## Project Structure

```text
frontend/
├── src/
│   ├── app/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   ├── page.tsx              # Home page with photo gallery
│   │   ├── admin/
│   │   │   └── page.tsx          # Admin dashboard
│   │   ├── api/
│   │   │   ├── photos/           # Photo API routes
│   │   │   └── upload/           # Upload API routes
│   │   ├── login/
│   │   │   └── page.tsx          # Login page
│   │   ├── results/
│   │   │   └── page.tsx          # Voting results
│   │   └── voting/
│   │       └── page.tsx          # Voting interface
│   ├── components/
│   │   ├── Navbar.tsx            # Navigation component
│   │   ├── PhotoCard.tsx         # Individual photo display
│   │   ├── PhotoGallery.tsx      # Photo grid layout
│   │   ├── PhotoUpload.tsx       # Upload interface
│   │   └── ui/                   # shadcn/ui components
│   ├── lib/
│   │   ├── api.ts               # Axios configuration
│   │   └── utils.ts             # Utility functions
│   ├── providers/
│   │   └── QueryProvider.tsx    # React Query provider
│   └── stores/
│       ├── adminStore.ts        # Admin state management
│       ├── authStore.ts         # Authentication state
│       └── votingStore.ts       # Voting state
├── Dockerfile
└── package.json
```

## Key Features

### Authentication Flow
- Google OAuth integration with JWT tokens
- Automatic token refresh on API calls
- Protected routes for authenticated users

### Photo Management
- Drag & drop photo upload
- Image preview before upload
- Photo gallery with responsive grid
- Delete functionality (with proper authorization)

### Voting System
- Like/dislike voting on photos
- Real-time vote counting
- Vote restrictions per user
- Results visualization

### Admin Features
- Contest settings management
- User management
- Voting controls (enable/disable)
- Analytics and reporting

## Pages & Routes

- `/` - Home page with photo gallery
- `/login` - Authentication page
- `/voting` - Voting interface for photos
- `/results` - Live voting results
- `/admin` - Admin dashboard (admin only)

## State Management

The application uses Zustand for state management:

- **authStore**: User authentication state and login/logout
- **votingStore**: Voting state and photo data
- **adminStore**: Admin-specific state and settings

## API Integration

The frontend communicates with the NestJS backend through:

- Axios HTTP client with interceptors
- Automatic token refresh handling
- React Query for efficient data fetching and caching
- Error handling and retry logic

## Deployment

### Production with Docker

```bash
docker-compose up --build -d
```

### Vercel Deployment

1. Connect your repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License