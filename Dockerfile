# ---- Base image ----
FROM hmctspublic.azurecr.io/base/node:12-alpine as base
COPY . .
USER hmcts
RUN yarn install && yarn build
EXPOSE 3000
