# Dockerfile para whatsapp-server
FROM node:18-alpine

# Directorio de trabajo
WORKDIR /app

# Copiar package.json y package-lock si existe para cachear npm install
COPY package*.json ./

# Instalar dependencias de producción (usar install si no hay package-lock.json)
# --omit=dev evita instalar devDependencies, --no-audit/--no-fund reducen salida
RUN npm install --omit=dev --no-audit --no-fund

# Copiar el resto del código
COPY . .

# Puerto expuesto
EXPOSE 3001

# Comando por defecto
CMD ["node", "server.js"]
