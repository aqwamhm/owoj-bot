FROM node:22-alpine
WORKDIR /app

RUN apk add --no-cache openssl

COPY package*.json .
RUN npm ci

COPY . .

RUN npx prisma generate

CMD ["npm", "start"]