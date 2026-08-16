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
RUN npm ci
COPY prisma ./prisma
RUN npx prisma generate

FROM node:24-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY dev-tls-ca.crt /usr/local/share/ca-certificates/dev-tls-ca.crt
RUN cat /usr/local/share/ca-certificates/dev-tls-ca.crt >> /etc/ssl/certs/ca-certificates.crt
ENV NODE_EXTRA_CA_CERTS=/usr/local/share/ca-certificates/dev-tls-ca.crt
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY --from=deps /app/src/generated ./src/generated
COPY src ./src
EXPOSE 3000
CMD ["node", "src/index.ts"]
