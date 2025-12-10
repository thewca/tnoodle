# global build args shared across all steps
ARG ONLINE

FROM gradle:9.2-jdk21 AS build

COPY --chown=gradle:gradle . /home/gradle/src
WORKDIR /home/gradle/src

# allow the frontend to run in restricted mode
# needs to be present at build time because CRA injects a "fake" process.env into the React code
ARG ONLINE
ENV REACT_APP_TNOODLE_ONLINE_MODE=${ONLINE:+"--online"}

RUN gradle buildOfficial --no-daemon

FROM eclipse-temurin:21-jre-alpine

RUN apk add --no-cache fontconfig ttf-dejavu
RUN ln -s /usr/lib/libfontconfig.so.1 /usr/lib/libfontconfig.so && \
    ln -s /lib/libuuid.so.1 /usr/lib/libuuid.so.1 && \
    ln -s /lib/libc.musl-x86_64.so.1 /usr/lib/libc.musl-x86_64.so.1
ENV LD_LIBRARY_PATH=/usr/lib

# We define the user we will use in this instance to prevent using root that even in a container, can be a security risk.
ENV APPLICATION_USER=wca

# Then we add the user, create the /app folder and give permissions to our user.
RUN adduser -D -g '' $APPLICATION_USER
RUN mkdir /app
RUN chown -R $APPLICATION_USER /app

# Marks this container to use the specified $APPLICATION_USER
USER $APPLICATION_USER

# We copy the FAT Jar we built into the /app folder and sets that folder as the working directory.
COPY --from=build /home/gradle/src/TNoodle-Build-latest.jar /app/tnoodle-application.jar
WORKDIR /app

# allow deployments to online Docker containers
# (requires TNoodle to mangle with Java runtime, see WebscramblesServer#main for details)
ARG ONLINE
ENV REACT_APP_TNOODLE_ONLINE_MODE=${ONLINE:+"--online"}

ARG PORT
# Set the port for the application to detect
ENV PORT=${PORT:-2014}

EXPOSE $PORT

# We launch java to execute the jar, with good defauls intended for containers.
CMD ["java", "-server", "-XX:InitialRAMPercentage=75.0", "-XX:MinRAMPercentage=75.0", "-XX:MaxRAMPercentage=75.0", "-XX:MaxGCPauseMillis=100", "-XX:+UseStringDeduplication", "-jar", "tnoodle-application.jar", "-b"]
