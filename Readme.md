# Photo Contest Application (CPC)

A full-stack photo contest application with authentication, voting system, and admin management. Built for competitive photo contests with user engagement and real-time results.

## 🏗️ Architecture

- **Frontend**: Next.js 14 with TypeScript, Tailwind CSS, and shadcn/ui
- **Backend**: NestJS with TypeScript and modular architecture
- **Database**: MongoDB with Mongoose ODM
- **Storage**: MinIO (S3-compatible) for photo storage
- **Authentication**: Google OAuth with JWT tokens
- **State Management**: Zustand stores
- **Data Fetching**: React Query for caching and synchronization
- **Container**: Docker Compose for full-stack orchestration

## ✨ Features

- 🔐 **Google OAuth Authentication** - Secure login with Google accounts
- 📸 **Photo Upload & Management** - Drag & drop upload with file validation
- �️ **Voting System** - Like/dislike voting with user restrictions
- 👑 **Admin Dashboard** - Contest management and settings control
- 📊 **Real-time Results** - Live voting statistics and leaderboards
- � **Google Sheets Integration** - Data synchronization with external sheets
- � **Responsive Design** - Mobile-first approach with modern UI
- 🛡️ **Role-based Access** - User and admin role management
- 🐳 **Full Docker Support** - Complete containerized development environment

## Project Structure

```
photo-upload-app/
├── backend/              # NestJS backend
│   ├── src/
│   │   ├── photo/       # Photo module
│   │   │   ├── photo.controller.ts
│   │   │   ├── photo.service.ts
│   │   │   ├── photo.schema.ts
│   │   │   ├── minio.service.ts
│   │   │   └── photo.module.ts
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── Dockerfile
│   └── package.json
├── frontend/            # Next.js frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── api/    # API routes (proxy to backend)
│   │   │   └── page.tsx
│   │   └── components/
│   │       ├── PhotoGallery.tsx
│   │       └── PhotoUpload.tsx
│   ├── Dockerfile
│   └── package.json
└── docker-compose.yml
```

## Getting Started

### Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for local development)

### Running with Docker Compose

1. Clone the repository
2. Start all services:

```bash
docker-compose up --build
```

3. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:4000
   - MinIO Console: http://localhost:9001 (credentials: minioadmin/minioadmin)
   - MongoDB: localhost:27017

### Local Development

#### Backend

```bash
cd backend
npm install
npm run start:dev
```

#### Frontend

```bash
cd frontend
npm install
npm run dev
```

Make sure MongoDB and MinIO are running locally or update the environment variables.

## Environment Variables

### Backend (.env)
```
PORT=4000
MONGODB_URI=mongodb://mongo:27017/photo-upload-db
MINIO_ENDPOINT=minio
MINIO_PORT=9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET_NAME=photos
MINIO_USE_SSL=false
```

### Frontend (.env.local)
```
BACKEND_URL=http://localhost:4000
```

## API Documentation

See [backend/README.md](backend/README.md) for detailed API documentation.

## How It Works

1. **Upload Flow**:
   - User selects a photo and enters their name
   - Frontend sends the photo to `/api/upload`
   - Frontend API proxies to backend `/photos/upload`
   - Backend saves file to MinIO and metadata to MongoDB
   - Metadata includes uploader name but it's not exposed in the gallery

2. **Gallery Flow**:
   - Frontend fetches photos from `/api/photos`
   - Backend retrieves metadata from MongoDB
   - Returns photo list WITHOUT uploader information (anonymous)
   - Generates presigned URLs for MinIO access

3. **Delete Flow**:
   - User clicks delete on a photo
   - Request goes to `/api/photos/:id`
   - Backend deletes from both MinIO and MongoDB

## Notes

- Photos are displayed anonymously (uploader name is stored but not shown)
- Currently manual upload only (as requested)
- MinIO presigned URLs expire after 24 hours
- All photo metadata is stored in MongoDB for future enhancements

## Future Enhancements

- User authentication
- Photo categories/tags
- Photo search functionality
- Pagination for large galleries
- Image optimization/thumbnails
