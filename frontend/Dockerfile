FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --include=dev || npm install
COPY . .
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
EXPOSE 3000
CMD ["npm","run","dev"]
