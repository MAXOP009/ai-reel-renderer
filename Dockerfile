FROM node:20-bullseye

RUN apt-get update && apt-get install -y ffmpeg fonts-dejavu-core

WORKDIR /app
COPY . .

RUN npm install

CMD ["npm", "start"]
