FROM node:14.19.3-alpine

WORKDIR /app
COPY . .

RUN yarn

CMD /usr/local/bin/node /app/index.js
