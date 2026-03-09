# Production image — uses pre-built artifacts from host
# Build on host first: npm run build && cd server && npm ci --omit=dev
FROM node:22-slim

RUN apt-get update && apt-get install -y --no-install-recommends curl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Create non-root user
RUN groupadd -r hailth && useradd -r -g hailth hailth

# Copy pre-built static files
COPY dist/ ./dist/

# Copy server code and dependencies
COPY server/ ./server/

# Create volume mount point for SQLite persistence
RUN mkdir -p /app/data && chown hailth:hailth /app/data

ENV PORT=4321
ENV STATIC_DIR=../dist
ENV DB_DIR=/app/data
ENV NODE_ENV=production

EXPOSE 4321

USER hailth

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:4321/api/health || exit 1

WORKDIR /app/server

CMD ["node", "index.js"]
