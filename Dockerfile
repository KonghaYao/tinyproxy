FROM monokal/tinyproxy:latest
RUN /opt/docker-tinyproxy/run.sh ANY
EXPOSE 8888
