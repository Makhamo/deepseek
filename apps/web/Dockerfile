# Build from the repository root:
#   docker build -f apps/web/Dockerfile -t uhs/web .
FROM node:22-alpine AS build
WORKDIR /repo
COPY . .
RUN npm ci
RUN npm run build --workspace @uhs/contracts \
 && npm run build --workspace @uhs/web

FROM node:22-alpine
WORKDIR /repo
ENV NODE_ENV=production
COPY --from=build /repo/node_modules ./node_modules
COPY --from=build /repo/packages ./packages
COPY --from=build /repo/apps/web ./apps/web
COPY --from=build /repo/package.json ./package.json
WORKDIR /repo/apps/web
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget -qO- "http://127.0.0.1:${PORT:-3000}/" > /dev/null || exit 1
CMD ["sh", "-c", "npx next start -p ${PORT:-3000}"]
