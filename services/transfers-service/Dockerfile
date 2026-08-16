FROM node:24-alpine AS deps
WORKDIR /app

COPY dev-tls-ca.crt /usr/local/share/ca-certificates/dev-tls-ca.crt
RUN cat /usr/local/share/ca-certificates/dev-tls-ca.crt >> /etc/ssl/certs/ca-certificates.crt
ENV NODE_EXTRA_CA_CERTS=/usr/local/share/ca-certificates/dev-tls-ca.crt
COPY package.json package-lock.json ./
COPY packages/shared/package.json packages/shared/package.json
COPY services/transfers-service/package.json services/transfers-service/package.json
RUN npm ci
COPY packages/shared/tsconfig.json packages/shared/tsconfig.json
COPY packages/shared/src packages/shared/src
RUN npm run build --workspace=@finance-api/shared
COPY services/transfers-service/prisma services/transfers-service/prisma
COPY services/transfers-service/prisma.config.ts services/transfers-service/prisma.config.ts
WORKDIR /app/services/transfers-service
RUN npx prisma generate

FROM node:24-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY dev-tls-ca.crt /usr/local/share/ca-certificates/dev-tls-ca.crt
RUN cat /usr/local/share/ca-certificates/dev-tls-ca.crt >> /etc/ssl/certs/ca-certificates.crt
ENV NODE_EXTRA_CA_CERTS=/usr/local/share/ca-certificates/dev-tls-ca.crt
COPY package.json package-lock.json ./
COPY packages/shared/package.json packages/shared/package.json
COPY services/transfers-service/package.json services/transfers-service/package.json
RUN npm ci --omit=dev
COPY --from=deps /app/packages/shared/dist ./packages/shared/dist
COPY --from=deps /app/services/transfers-service/src/generated ./services/transfers-service/src/generated
COPY services/transfers-service/src services/transfers-service/src
COPY services/transfers-service/prisma.config.ts services/transfers-service/prisma.config.ts
WORKDIR /app/services/transfers-service
EXPOSE 3003
CMD ["node", "src/index.ts"]
