FROM node:20-bookworm-slim

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY app.js _index.html webpack.config.js webpack.development.config.js ./
COPY client/ ./client/
COPY server/ ./server/
COPY templates/ ./templates/
COPY public/ ./public/
COPY config/default.json ./config/default.json
COPY config/local.example.json ./config/local.example.json
COPY config/local.production.example.json ./config/local.production.example.json

RUN npm run build

ENV NODE_ENV=production

EXPOSE 3000

CMD ["node", "--openssl-legacy-provider", "app.js"]
