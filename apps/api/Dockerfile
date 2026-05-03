FROM node:20-alpine AS base
WORKDIR /app

# Prisma's migration engine requires OpenSSL on Alpine
RUN apk add --no-cache openssl

# Copy workspace manifests + lock file for reproducible installs
COPY package.json package-lock.json ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/api/package.json ./apps/api/

# Install all dependencies — skip postinstall (shared source not yet present)
RUN npm ci --workspaces --include-workspace-root --ignore-scripts

# Copy source
COPY packages/shared ./packages/shared
COPY apps/api ./apps/api

# Build shared package
RUN npm run build --workspace=packages/shared

# Generate Prisma client
RUN cd apps/api && npx prisma generate

# Build API
RUN npm run build --workspace=apps/api

WORKDIR /app/apps/api

EXPOSE 4000

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]
