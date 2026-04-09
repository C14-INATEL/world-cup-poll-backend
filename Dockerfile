FROM node:22-bookworm-slim AS deps

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev


FROM node:22-bookworm-slim AS build

WORKDIR /app

ARG DATABASE_URL
ARG FOOTBALL_API_KEY=docker-build

ENV DATABASE_URL=$DATABASE_URL
ENV FOOTBALL_API_KEY=$FOOTBALL_API_KEY

COPY package.json package-lock.json ./
RUN npm ci

COPY tsconfig.json tsconfig.build.json ./
COPY src ./src
COPY drizzle.config.* ./

RUN npm run build
RUN npx drizzle-kit generate


FROM node:22-bookworm-slim AS runner

WORKDIR /app
ENV NODE_ENV=production

COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/drizzle.config.* ./
COPY --from=build /app/drizzle ./drizzle
COPY package.json ./

USER node

EXPOSE 3333
CMD ["node", "dist/src/server.js"]