# syntax=docker/dockerfile:1
FROM node:24-alpine
RUN npm install -g pnpm@10.30.0
WORKDIR /app
COPY package.json pnpm-lock.yaml .npmrc ./
RUN pnpm install --frozen-lockfile --prod=false --shamefully-hoist
COPY . .
RUN npx prisma generate
EXPOSE 3001
CMD ["pnpm", "run", "start:dev"]