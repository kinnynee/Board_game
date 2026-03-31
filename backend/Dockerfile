<<<<<<< HEAD
FROM node:22-alpine
=======
FROM node:20-alpine
>>>>>>> 06170f5a5e6b6979cccd2b4ff1fd1ea4a02eb102

WORKDIR /app

COPY package*.json ./
<<<<<<< HEAD
RUN npm ci

COPY . .

EXPOSE 3001

CMD ["sh", "-c", "npm run migrate && npm run seed && npm start"]
=======
RUN npm install

COPY . .

EXPOSE 5000

CMD ["npm", "start"]

>>>>>>> 06170f5a5e6b6979cccd2b4ff1fd1ea4a02eb102
