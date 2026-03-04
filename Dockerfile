# ── Build stage ────────────────────────────────────────────────
FROM node:22-slim AS build

WORKDIR /app

# Install dependencies first (layer caching)
COPY package.json package-lock.json* ./
RUN npm ci --ignore-scripts

# Copy source and build
COPY tsconfig.json ./
COPY src/ ./src/
RUN npm run build

# ── Production stage ──────────────────────────────────────────
FROM node:22-slim

# Install Azure CLI for az boards / az devops commands
RUN apt-get update && \
    apt-get install -y --no-install-recommends ca-certificates curl gnupg lsb-release && \
    curl -sL https://aka.ms/InstallAzureCLIDeb | bash && \
    az extension add --name azure-devops && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy built output and production dependencies
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev --ignore-scripts

COPY --from=build /app/dist/ ./dist/
COPY public/ ./public/

# Non-root user for security
RUN addgroup --system --gid 1001 appgroup && \
    adduser --system --uid 1001 --ingroup appgroup appuser
USER appuser

EXPOSE 3000

ENV NODE_ENV=production
ENV PORT=3000

CMD ["node", "dist/server.js"]
