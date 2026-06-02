FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json* ./
COPY apps/api/package.json apps/api/
COPY apps/web/package.json apps/web/
RUN npm install
COPY apps/api apps/api
COPY apps/web apps/web
RUN npm run build

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
ENV DATA_DIR=/data
COPY package.json package-lock.json* ./
COPY apps/api/package.json apps/api/
RUN npm install --omit=dev -w @slip/api
COPY --from=build /app/apps/api/dist apps/api/dist
COPY --from=build /app/apps/web/dist apps/web/dist
EXPOSE 3001
CMD ["node", "apps/api/dist/index.js"]
