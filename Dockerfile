# install
FROM oven/bun:latest as builder
WORKDIR /app
COPY package.json bun.lock* ./
COPY apps/web/package.json ./apps/web/
COPY packages/*/package.json ./packages/*/
RUN bun install
WORKDIR /app/apps/web
RUN bun install
WORKDIR /app/packages/db
RUN bun install
WORKDIR /app/packages/auth
RUN bun install
# build
COPY . .
WORKDIR /app
RUN bun run build

# prod
FROM oven/bun:latest
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder /app/apps/web/public ./apps/web/public
COPY --from=builder /app/packages/auth  ./packages/auth
COPY --from=builder /app/packages/db ./packages/db
RUN chown -R nextjs:nodejs /app
USER nextjs
EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["bun", "start"]
