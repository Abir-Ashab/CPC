# Photo Upload Application

A full-stack photo upload application with anonymous gallery viewing. Users can upload photos with their name, but the gallery displays photos anonymously.

## Architecture

- **Frontend**: Next.js 14 with TypeScript and Tailwind CSS
- **Backend**: NestJS with TypeScript
- **Database**: MongoDB for photo metadata
- **Storage**: MinIO for object storage
- **Container**: Docker Compose for orchestration

## Features

- 📸 Photo upload with drag & drop support
- 👤 User name tracking (stored but not displayed)
- 🖼️ Anonymous photo gallery
- 🗑️ Photo deletion
- 🐳 Fully containerized with Docker
- 🔄 **Google Form Integration** - Automated bulk sync from Google Form submissions
- 📊 **Participant Metadata** - Store and track participant information (email, name, Slack ID, team, captions)
- 🔍 **Duplicate Prevention** - Automatically skips participants already in database

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

## Google Form Integration (Automated Photo Sync)

Automatically sync photos and participant data from Google Form submissions!

### Setup (One-time)

1. **Get Google API Credentials:**
   - Go to https://console.cloud.google.com/
   - Enable **Google Drive API** and **Google Sheets API**
   - Create OAuth 2.0 credentials (Desktop app)
   - Download as `backend/credentials.json`

2. **Run the sync:**
   ```bash
   cd backend
   npm run google-form-sync
   ```

3. **First time:** Authorize with Google and enter your form's Spreadsheet ID

### Form Structure

Your Google Form should collect:
- ✅ Email (automatic from Google account)
- ✅ Name (according to HR Portal)
- ✅ Slack ID (according to HR Portal)
- ✅ Team Name
- ✅ Caption for Photo 1, 2, 3
- ✅ File uploads (up to 5 images)

### Features

- 🔄 **Automatic sync** - Downloads photos from Google Drive
- � **Complete metadata** - Saves all participant information
- � **Duplicate prevention** - Skips participants already in database
- � **Progress tracking** - Shows real-time upload status
- 🛡️ **Error handling** - Continues on failures, reports summary
