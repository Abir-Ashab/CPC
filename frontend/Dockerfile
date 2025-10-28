
FROM node:20-alpine AS builder
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build


FROM node:20-alpine AS production
LABEL com.cefalo.project="photography-competition"
WORKDIR /app
ENV PORT=8080
ENV NODE_ENV=production
COPY --from=builder /app .
EXPOSE 8080
CMD ["npm", "run", "start"]
