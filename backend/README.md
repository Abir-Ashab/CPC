# Photo Upload Application - Backend

NestJS backend service for handling photo uploads with MinIO storage and MongoDB metadata.

## Features

- File upload to MinIO object storage
- Photo metadata storage in MongoDB
- User information tracking (anonymous in API responses)
- RESTful API endpoints

## Tech Stack

- **NestJS**: Backend framework
- **MongoDB**: Database for metadata
- **MinIO**: Object storage for photos
- **TypeScript**: Programming language

## API Endpoints

### Upload Photo
```
POST /photos/upload
Content-Type: multipart/form-data

Body:
- file: Image file
- photoName: Name for the photo (optional)
- uploadedBy: Name of the uploader (required)
```

### Get All Photos
```
GET /photos

Response: {
  photos: [
    {
      id: string,
      name: string,
      url: string,
      uploadedAt: Date
    }
  ]
}
```

### Delete Photo
```
DELETE /photos/:id
```

## Database Schema

### Photo Collection
```typescript
{
  name: string;           // Display name of the photo
  fileName: string;       // Actual filename in MinIO
  url: string;           // Presigned URL for access
  uploadedBy: string;    // Name of uploader (not exposed in API)
  contentType: string;   // MIME type
  size: number;          // File size in bytes
  uploadedAt: Date;      // Upload timestamp
}
```

## Environment Variables

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

## Local Development

1. Install dependencies:
```bash
npm install
```

2. Make sure MongoDB and MinIO are running

3. Start development server:
```bash
npm run start:dev
```

4. Run Google Form sync (optional):
```bash
cd backend
npm run google-form-sync
```

The backend will be available at `http://localhost:4000`
