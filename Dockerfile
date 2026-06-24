# syntax=docker/dockerfile:1

# ---- Build stage: compile the static SPA with Vite ----
FROM node:22-alpine AS build
WORKDIR /app

# Install dependencies against the lockfile for reproducible builds.
COPY package.json package-lock.json ./
RUN npm ci

# Build the static site into /app/dist.
COPY . .
RUN npm run build

# ---- Runtime stage: serve the static files with nginx ----
FROM nginx:1.27-alpine AS runtime

# SPA-aware nginx config (history fallback + asset caching).
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Ship only the built assets.
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

# Basic healthcheck so Coolify can tell the container is live.
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -q --spider http://localhost:80/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
