FROM node:18

WORKDIR /app

COPY . .

ENV PORT 3000

RUN npm install

ENV DEBUG provider:*

CMD ["node", "index.js"]
