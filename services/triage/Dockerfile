# Build from the repository root:
#   docker build -f services/triage/Dockerfile -t uhs/triage .
FROM node:22-alpine AS build
WORKDIR /repo
COPY . .
RUN npm ci
RUN npm run build --workspace @uhs/contracts \
 && npm run build --workspace @uhs/service-kit \
 && npm run build --workspace @uhs/triage

FROM node:22-alpine
WORKDIR /repo
ENV NODE_ENV=production
COPY --from=build /repo/node_modules ./node_modules
COPY --from=build /repo/packages ./packages
COPY --from=build /repo/services/triage ./services/triage
COPY --from=build /repo/package.json ./package.json
WORKDIR /repo/services/triage
EXPOSE 4004
CMD ["node", "dist/main.js"]
