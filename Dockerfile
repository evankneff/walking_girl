# Multi-stage build for full application

# Stage 1: Build React client
FROM node:18-alpine AS client-builder
WORKDIR /app/client
COPY client/package*.json ./
RUN npm install
COPY client/ ./
RUN npm run build

# Stage 2: Build server
FROM node:18-alpine AS server-deps
WORKDIR /app/server
COPY server/package*.json ./
RUN npm install --omit=dev

# Stage 3: Final image
FROM node:18-alpine
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nodejs

# Copy server dependencies
COPY --from=server-deps /app/server/node_modules ./server/node_modules
COPY --from=server-deps /app/server/package*.json ./server/
COPY server/src ./server/src

# Copy built client
COPY --from=client-builder /app/client/build ./client/build

RUN chown -R nodejs:nodejs /app

USER nodejs

WORKDIR /app/server

EXPOSE 3001

CMD ["node", "src/server.js"]

