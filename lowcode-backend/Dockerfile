FROM node:22-bookworm-slim

WORKDIR /app

# toolchain para nativos (bcrypt)
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 make g++ ca-certificates curl && \
    rm -rf /var/lib/apt/lists/*

# Fuerza compilar desde fuente cualquier nativo (bcrypt)
ENV npm_config_build_from_source=true
# Evita descargas de prebuilds de node-pre-gyp
ENV npm_config_unsafe_perm=true

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .
ENV NODE_ENV=production
EXPOSE 4000
CMD ["node","src/server.js"]