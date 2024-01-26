ARG UID=1000
ARG GID=1000
FROM node:latest-alpine
ARG UID
ARG GID
RUN deluser node
RUN (getent group ${GID} && echo "Group exists") || (addgroup -g ${GID} -S user && echo "Adding group")
RUN adduser -u ${UID} -g ${GID} -S node
USER node
CMD ["tail", "-f", "/dev/null"]