FROM node:22-alpine
WORKDIR /app

COPY package*.json ./
COPY coordinator/package*.json ./coordinator/
COPY agents/sre-agent/package*.json ./agents/sre-agent/
COPY agents/sec-agent/package*.json ./agents/sec-agent/
COPY ui/package*.json ./ui/

RUN npm install

COPY . .

RUN npm run build --if-present

EXPOSE 3000 3001 3002
CMD ["npm", "start", "--workspace=coordinator"]
