FROM node:18-alpine
WORKDIR /app
COPY backend/package*.json ./backend/
RUN cd backend && npm install --production
COPY backend/ ./backend/
EXPOSE 3002
CMD ["node", "backend/server.js"]
