FROM gradle:8.5-jdk11 AS build

COPY --chown=gradle:gradle . /home/gradle/src
WORKDIR /home/gradle/src

RUN gradle buildOfficial --no-daemon

FROM eclipse-temurin:11-jre-alpine

RUN apk add --no-cache fontconfig ttf-dejavu
RUN ln -s /usr/lib/libfontconfig.so.1 /usr/lib/libfontconfig.so && \
    ln -s /lib/libuuid.so.1 /usr/lib/libuuid.so.1 && \
    ln -s /lib/libc.musl-x86_64.so.1 /usr/lib/libc.musl-x86_64.so.1
ENV LD_LIBRARY_PATH /usr/lib

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
# If the arg ONLINE was passed, add flag
ENV ONLINE_MODE=${ONLINE:+"--online"}
# If no flag is present yet, explicitly assign an empty string
ENV ONLINE_MODE=${ONLINE_MODE:-""}

# Set the port for the application to detect
ENV PORT=${PORT:-2014}

# We launch java to execute the jar, with good defauls intended for containers.
CMD java -server -XX:+UnlockExperimentalVMOptions -XX:InitialRAMFraction=2 -XX:MinRAMFraction=2 -XX:MaxRAMFraction=2 -XX:+UseG1GC -XX:MaxGCPauseMillis=100 -XX:+UseStringDeduplication -jar tnoodle-application.jar $ONLINE_MODE -b
