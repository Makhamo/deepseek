# Build from the repository root:
#   docker build -f services/doctor/Dockerfile -t uhs/doctor .
FROM node:22-alpine AS build
WORKDIR /repo
COPY . .
RUN npm ci
RUN npm run build --workspace @uhs/contracts \
 && npm run build --workspace @uhs/service-kit \
 && npm run build --workspace @uhs/doctor

FROM node:22-alpine
WORKDIR /repo
ENV NODE_ENV=production
COPY --from=build /repo/node_modules ./node_modules
COPY --from=build /repo/packages ./packages
COPY --from=build /repo/services/doctor ./services/doctor
COPY --from=build /repo/package.json ./package.json
WORKDIR /repo/services/doctor
EXPOSE 4003
CMD ["node", "dist/main.js"]
