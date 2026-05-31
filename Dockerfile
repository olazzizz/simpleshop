FROM registry.access.redhat.com/ubi9/nodejs-22

USER root

WORKDIR /opt/app-root/src/backend

COPY backend/package*.json ./
RUN npm ci --omit=dev
COPY backend/ ./

COPY index.html app.js styles.css /opt/app-root/src/

RUN chown -R 1001:0 /opt/app-root/src && chmod -R g=u /opt/app-root/src

USER 1001

EXPOSE 3000

CMD ["node", "server.js"]
