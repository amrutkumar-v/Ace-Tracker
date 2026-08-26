FROM node:24-alpine

WORKDIR /app

COPY backend/package.json backend/package-lock.json ./backend/
RUN npm --prefix backend ci --omit=dev

COPY . .

ENV NODE_ENV=production
ENV COOKIE_SECURE=true
ENV DATA_DIR=/data

VOLUME ["/data"]
EXPOSE 3000

CMD ["node", "backend/server.js"]
