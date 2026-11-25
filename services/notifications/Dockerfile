# Build from the repository root:
#   docker build -f services/notifications/Dockerfile -t uhs/notifications .
FROM node:22-alpine AS build
WORKDIR /repo
COPY . .
RUN npm ci
RUN npm run build --workspace @uhs/contracts \
 && npm run build --workspace @uhs/service-kit \
 && npm run build --workspace @uhs/notifications

FROM node:22-alpine
WORKDIR /repo
ENV NODE_ENV=production
COPY --from=build /repo/node_modules ./node_modules
COPY --from=build /repo/packages ./packages
COPY --from=build /repo/services/notifications ./services/notifications
COPY --from=build /repo/package.json ./package.json
WORKDIR /repo/services/notifications
EXPOSE 4009
CMD ["node", "dist/main.js"]
