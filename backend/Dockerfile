FROM node:20-alpine

LABEL com.cefalo.project="photography-competition"

WORKDIR /app

COPY package*.json ./
RUN npm install --ignore-scripts

COPY . .

RUN npm run build

EXPOSE 5000

ENV NODE_ENV=production
CMD ["node", "dist/src/main.js"]
