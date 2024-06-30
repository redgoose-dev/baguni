ARG TAG=slim
FROM oven/bun:${TAG}
WORKDIR /app

#set variables
ENV EMAIL=""
ENV NAME=""
ENV PASSWORD=""
ENV VITE_PORT=80

# copy resource
COPY . /app

# install dependencies
RUN bun install --frozen-lockfile

EXPOSE 80

# run entrypoint
RUN chmod +x /app/resource/docker-entrypoint.sh
ENTRYPOINT [ "resource/docker-entrypoint.sh" ]
