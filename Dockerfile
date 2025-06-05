FROM node:20-slim

# Instalar dependências do sistema
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copiar arquivos de dependências
COPY package.json package-lock.json ./

# Instalar dependências
RUN npm ci

# Copiar schema do Prisma
COPY prisma ./prisma

# Gerar cliente Prisma
RUN npx prisma generate

# Copiar código fonte
COPY . .

# Build da aplicação
RUN npm run build

# Remover devDependencies para reduzir tamanho (opcional)
RUN npm prune --omit=dev

EXPOSE 3000

CMD ["node", "dist/main.js"]