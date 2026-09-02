FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
RUN npm run build

FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3001
ENV HOSTNAME=0.0.0.0

USER node

COPY --chown=node:node package*.json ./
COPY --chown=node:node --from=builder /app/.next ./.next
COPY --chown=node:node --from=builder /app/node_modules ./node_modules

EXPOSE 3001

CMD ["npm", "run", "start"]
