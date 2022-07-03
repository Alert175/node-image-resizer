FROM node:16-alpine

EXPOSE 5002

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install
# RUN npm ci --only=production

COPY . .

CMD [ "node", "cmd/main.js" ]