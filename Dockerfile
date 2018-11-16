FROM nginx:alpine
COPY ./default.conf /etc/nginx/conf.d/default.conf
COPY ./dist/chatApp /usr/share/nginx/html

# FROM node:10.8.0-alpine as node
# COPY ./dist /app
# RUN mkdir -p /app
# WORKDIR /app
# COPY package.json /app
# RUN npm install

# EXPOSE 4200
# CMD ["npm", "start"]


