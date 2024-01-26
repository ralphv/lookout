ARG UID=1000
ARG GID=1000
#FROM docker/compose:alpine-1.29.2 as COMPOSE

FROM node:21-alpine
ARG UID
ARG GID

LABEL org.opencontainers.image.authors="Ralph Varjabedian"
LABEL author="Ralph Varjabedian"
LABEL git="https://github.com/ralphv/lookout"

RUN apk update && apk upgrade
RUN apk --no-cache add docker-cli docker-cli-compose
#COPY --from=COMPOSE /usr/local/bin/docker-compose /usr/local/bin/docker-compose

#RUN deluser node
#RUN (getent group ${GID} && echo "Group exists") || (addgroup -g ${GID} -S user && echo "Adding group")
#RUN adduser -u ${UID} -g ${GID} -S node
#RUN addgroup node docker
#RUN addgroup node user
#USER node

WORKDIR /app
COPY ./package.json .
COPY ./package-lock.json .
COPY ./dist .
VOLUME /config
VOLUME /data

ENV NODE_ENV production
RUN npm install --omit=dev

ENTRYPOINT [ "node", "src/app.js" ]