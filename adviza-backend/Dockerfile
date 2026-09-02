# Stage 1: Build & Prune Dependencies
FROM node:22-alpine AS builder

WORKDIR /app

# Install build dependencies
COPY package*.json tsconfig.json ./
RUN npm ci

# Copy source and compile TypeScript
COPY src/ ./src/
RUN npm run build && npm prune --omit=dev

# Stage 2: Production Minimal Runtime
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=4000
ENV HOST=0.0.0.0

# Install curl for container healthcheck
RUN apk add --no-cache curl

# Security: Run as unprivileged node user
USER node

# Copy only production dependencies and compiled artifacts
COPY --chown=node:node package*.json ./
COPY --chown=node:node --from=builder /app/node_modules ./node_modules
COPY --chown=node:node --from=builder /app/dist ./dist

EXPOSE 4000

# Health check to ensure zero-downtime rolling updates
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:4000/v1/health || exit 1

CMD ["node", "dist/index.js"]
