FROM node:14
WORKDIR /app
COPY main.js package.json package-lock.json ./
RUN npm ci
ENTRYPOINT [ "npm", "start" ]