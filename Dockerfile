ARG IMAGE_TAG=alpine

# Build stage
FROM oven/bun:${IMAGE_TAG} AS builder
WORKDIR /app

COPY . .

RUN bun install --frozen-lockfile --verbose
RUN bun run build
RUN rm -rf node_modules
RUN bun install --production --verbose
RUN rm -rf /tmp/* /root/.bun/cache

# Runtime stage
FROM oven/bun:${IMAGE_TAG}
WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/resource ./resource
COPY --from=builder /app/.env ./.env
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/jsconfig.json ./jsconfig.json

EXPOSE 80

# run cmd
CMD [ "bun", "run", "preview" ]
