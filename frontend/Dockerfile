<<<<<<< HEAD
FROM node:22-alpine AS build

WORKDIR /app

ARG VITE_API_BASE_URL=/api
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

COPY package*.json ./
RUN npm ci
=======
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install
>>>>>>> 06170f5a5e6b6979cccd2b4ff1fd1ea4a02eb102

COPY . .
RUN npm run build

FROM nginx:1.27-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
<<<<<<< HEAD
=======

CMD ["nginx", "-g", "daemon off;"]

>>>>>>> 06170f5a5e6b6979cccd2b4ff1fd1ea4a02eb102
