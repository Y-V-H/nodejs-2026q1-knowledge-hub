# Stage 1 
FROM node:24-alpine AS build
WORKDIR /app

# Install the application dependencies
COPY package.json package-lock.json ./
RUN npm i
COPY . .
ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"
RUN ./node_modules/.bin/prisma generate
RUN npm run build

# Stage 2
FROM node:24-alpine AS production
WORKDIR /app
COPY --from=build /app/package.json /app/package-lock.json /app/
COPY --from=build /app/dist /app/dist
COPY --from=build /app/generated /app/dist/generated
RUN npm install --omit=dev
RUN apk add --no-cache curl

RUN adduser -D mobydick
USER mobydick

ENV NODE_ENV=production
EXPOSE 4000

CMD ["node", "dist/src/main.js"]