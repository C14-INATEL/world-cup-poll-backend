FROM node:22.16-bookworm-slim AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY tsconfig.json tsconfig.build.json ./
COPY src ./src
COPY drizzle ./drizzle

RUN npm run build
RUN npm prune --omit=dev


FROM node:22.16-bookworm-slim AS runner

WORKDIR /app
ENV NODE_ENV=production

COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/drizzle ./drizzle
COPY package.json ./
COPY entrypoint.sh ./

RUN mkdir -p /app/logs && \
    chown -R node:node /app && \
    chmod +x ./entrypoint.sh

HEALTHCHECK --interval=10s --timeout=5s --retries=5 \
    CMD node -e "fetch('http://localhost:3333/health').then(r => r.ok ? process.exit(0) : process.exit(1)).catch(() => process.exit(1))"

USER node

EXPOSE 3333
CMD ["sh", "entrypoint.sh"]