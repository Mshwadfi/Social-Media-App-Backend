FROM node:20 AS development
WORKDIR /app
COPY  package.json .
RUN npm install
COPY . .
EXPOSE 4000

CMD ["npm" , "run", "dev"]

FROM node:20 AS production
WORKDIR /app
COPY  package.json .
RUN npm install --only=production
COPY . .
EXPOSE 4000

CMD ["npm" , "start"]