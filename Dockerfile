FROM oven/bun:1.4.2 AS builder
WORKDIR /app
COPY . .
RUN bun install --frozen-lockfile
RUN bun run build

FROM oven/bun:1.4.2
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
# Preserve the workspace layout and Bun's workspace dependency symlinks.
COPY --from=builder /app/package.json /app/bun.lock ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/apps/web ./apps/web
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
CMD ["bun", "start"]
