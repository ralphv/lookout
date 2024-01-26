ARG UID=1000
ARG GID=1000

FROM node:21-alpine
ARG UID
ARG GID

LABEL org.opencontainers.image.authors="Ralph Varjabedian"
LABEL author="Ralph Varjabedian"
LABEL git="https://github.com/ralphv/lookout"

RUN apk update && apk upgrade
RUN apk --no-cache add docker-cli docker-cli-compose

WORKDIR /app
COPY ./package.json .
COPY ./package-lock.json .
COPY ./dist .
VOLUME /config
VOLUME /data

ENV NODE_ENV production
RUN npm install --omit=dev

ENTRYPOINT [ "node", "src/app.js" ]