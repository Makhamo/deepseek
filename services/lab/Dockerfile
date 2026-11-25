# Build from the repository root:
#   docker build -f services/lab/Dockerfile -t uhs/lab .
FROM node:22-alpine AS build
WORKDIR /repo
COPY . .
RUN npm ci
RUN npm run build --workspace @uhs/contracts \
 && npm run build --workspace @uhs/service-kit \
 && npm run build --workspace @uhs/lab

FROM node:22-alpine
WORKDIR /repo
ENV NODE_ENV=production
COPY --from=build /repo/node_modules ./node_modules
COPY --from=build /repo/packages ./packages
COPY --from=build /repo/services/lab ./services/lab
COPY --from=build /repo/package.json ./package.json
WORKDIR /repo/services/lab
EXPOSE 4005
CMD ["node", "dist/main.js"]
