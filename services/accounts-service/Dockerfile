FROM node:24-alpine AS deps
WORKDIR /app

COPY dev-tls-ca.crt /usr/local/share/ca-certificates/dev-tls-ca.crt
RUN cat /usr/local/share/ca-certificates/dev-tls-ca.crt >> /etc/ssl/certs/ca-certificates.crt
ENV NODE_EXTRA_CA_CERTS=/usr/local/share/ca-certificates/dev-tls-ca.crt
COPY package.json package-lock.json ./
COPY services/accounts-service/package.json services/accounts-service/package.json
RUN npm ci
COPY services/accounts-service/prisma services/accounts-service/prisma
COPY services/accounts-service/prisma.config.ts services/accounts-service/prisma.config.ts
WORKDIR /app/services/accounts-service
RUN npx prisma generate

FROM node:24-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY dev-tls-ca.crt /usr/local/share/ca-certificates/dev-tls-ca.crt
RUN cat /usr/local/share/ca-certificates/dev-tls-ca.crt >> /etc/ssl/certs/ca-certificates.crt
ENV NODE_EXTRA_CA_CERTS=/usr/local/share/ca-certificates/dev-tls-ca.crt
COPY package.json package-lock.json ./
COPY services/accounts-service/package.json services/accounts-service/package.json
RUN npm ci --omit=dev
COPY --from=deps /app/services/accounts-service/src/generated ./services/accounts-service/src/generated
COPY services/accounts-service/src services/accounts-service/src
COPY services/accounts-service/prisma.config.ts services/accounts-service/prisma.config.ts
WORKDIR /app/services/accounts-service
EXPOSE 3002
CMD ["node", "src/index.ts"]
