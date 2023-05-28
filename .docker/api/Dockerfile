FROM node:lts

WORKDIR /usr/api

COPY package*.json .

RUN npm install

COPY . .

CMD npm run start