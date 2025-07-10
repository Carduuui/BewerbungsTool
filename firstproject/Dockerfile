# Dockerfile für Railway mit Playwright Support
FROM node:18-slim

# Playwright-Abhängigkeiten installieren
RUN apt-get update && apt-get install -y \
    libnss3 \
    libatk-bridge2.0-0 \
    libdrm2 \
    libxkbcommon0 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    libgbm1 \
    libxss1 \
    libasound2 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Package files kopieren
COPY package*.json ./

# Dependencies installieren
RUN npm ci --only=production

# Playwright Browser installieren
RUN npx playwright install chromium

# App-Code kopieren
COPY . .

# Next.js build
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]