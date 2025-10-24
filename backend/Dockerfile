# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies
RUN npm install

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Verify build output
RUN ls -la dist/ && \
    ls -la dist/src/ && \
    if [ ! -f "dist/src/main.js" ]; then \
        echo "ERROR: Build failed - main.js not found in dist/src/" && \
        find dist/ -name "*.js" -type f && \
        exit 1; \
    fi

# Production stage
FROM node:18-alpine AS production

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist

# Copy other necessary files
COPY --from=builder /app/credentials.json ./credentials.json
COPY --from=builder /app/token.json ./token.json

EXPOSE 5000

CMD ["node", "dist/src/main.js"]
