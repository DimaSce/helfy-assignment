FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache bash wget

COPY package*.json ./
RUN npm install

COPY . .

# Скачиваем wait-for-it.sh
RUN wget -O wait-for-it.sh https://raw.githubusercontent.com/vishnubob/wait-for-it/master/wait-for-it.sh \
    && chmod +x wait-for-it.sh

EXPOSE 5000

CMD ["bash", "./wait-for-it.sh", "tidb:4000", "--timeout=60", "--", "node", "index.js"]
