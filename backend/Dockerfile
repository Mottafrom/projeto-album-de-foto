FROM node:22-alpine AS deps
WORKDIR /app
RUN apk add --no-cache libc6-compat
COPY package.json package-lock.json ./
COPY backend/package.json ./backend/
COPY frontend/package.json ./frontend/
RUN npm ci -w backend

FROM node:22-alpine AS build
WORKDIR /app
RUN apk add --no-cache libc6-compat
COPY --from=deps /app/node_modules ./node_modules
COPY package.json package-lock.json ./
COPY backend ./backend
RUN npm run build -w backend

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN apk add --no-cache libc6-compat
COPY package.json package-lock.json ./
COPY backend/package.json ./backend/
RUN npm ci -w backend --omit=dev
COPY --from=build /app/backend/dist ./backend/dist
COPY backend/migrations ./backend/migrations
WORKDIR /app/backend
EXPOSE 3001
CMD ["node", "dist/server.js"]
