FROM node:20-alpine AS base
WORKDIR /app

# Copy workspace manifests + lock file for reproducible installs
# apps/api is stubbed so npm workspace scan doesn't warn about a missing package
COPY package.json package-lock.json ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/

# Install dependencies — skip postinstall (shared source not yet present)
RUN npm ci --workspaces --include-workspace-root --ignore-scripts

# Copy source
COPY packages/shared ./packages/shared
COPY apps/web ./apps/web

# Build shared
RUN npm run build --workspace=packages/shared

WORKDIR /app/apps/web

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

ARG NEXT_PUBLIC_API_URL=http://localhost:4000
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
