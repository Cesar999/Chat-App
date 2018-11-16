FROM node:10.8.0-alpine as node
RUN mkdir -p /app
WORKDIR /app
COPY package.json /app
RUN npm install
COPY . /app
EXPOSE 3001
CMD ["npm", "start"]
