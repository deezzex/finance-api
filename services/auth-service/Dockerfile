# Built with the repo root as build context (see docker-compose.yml) —
# npm workspaces keep a single package-lock.json at the root, so
# `npm ci` needs that root context, not this directory alone.
FROM node:24-alpine AS deps
WORKDIR /app
# dev-tls-ca.crt: this machine's ESET antivirus intercepts outbound HTTPS from
# Docker containers (its SSL-filtering root CA), which breaks Prisma's engine
# download over HTTPS unless Node is told to trust it too. Machine-specific,
# not committed — see .gitignore.
COPY dev-tls-ca.crt /usr/local/share/ca-certificates/dev-tls-ca.crt
RUN cat /usr/local/share/ca-certificates/dev-tls-ca.crt >> /etc/ssl/certs/ca-certificates.crt
ENV NODE_EXTRA_CA_CERTS=/usr/local/share/ca-certificates/dev-tls-ca.crt
COPY package.json package-lock.json ./
COPY services/auth-service/package.json services/auth-service/package.json
RUN npm ci
COPY services/auth-service/prisma services/auth-service/prisma
COPY services/auth-service/prisma.config.ts services/auth-service/prisma.config.ts
WORKDIR /app/services/auth-service
RUN npx prisma generate

FROM node:24-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY dev-tls-ca.crt /usr/local/share/ca-certificates/dev-tls-ca.crt
RUN cat /usr/local/share/ca-certificates/dev-tls-ca.crt >> /etc/ssl/certs/ca-certificates.crt
ENV NODE_EXTRA_CA_CERTS=/usr/local/share/ca-certificates/dev-tls-ca.crt
COPY package.json package-lock.json ./
COPY services/auth-service/package.json services/auth-service/package.json
RUN npm ci --omit=dev
COPY --from=deps /app/services/auth-service/src/generated ./services/auth-service/src/generated
COPY services/auth-service/src services/auth-service/src
COPY services/auth-service/prisma.config.ts services/auth-service/prisma.config.ts
WORKDIR /app/services/auth-service
EXPOSE 3001
CMD ["node", "src/index.ts"]
