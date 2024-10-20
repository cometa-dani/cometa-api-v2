FROM node:lts-slim

RUN apt update && apt install -y procps openssl

EXPOSE 3000

WORKDIR /app

# RUN addgroup --system cometa-api && \
#     adduser --system -G cometa-api cometa-api

COPY dist/cometa-api cometa-api
COPY prisma cometa-api/prisma
# COPY public cometa-api/public
# COPY uploads cometa-api/uploads
# RUN chown -R cometa-api:cometa-api .

# You can remove this install step if you build with `--bundle` option.
# The bundled output will include external dependencies.
RUN npm --prefix cometa-api --omit=dev install

# RUN npm install -g yarn && yarn install --build-from-source

WORKDIR /app/cometa-api

RUN npx prisma generate
# This file is generated by Nx.
# Run Prisma migrations and seed data
# CMD npx prisma migrate dev --name init && npx prisma db seed && node main.js
CMD node main.js
# pass --env-file=.env
# when running the container
