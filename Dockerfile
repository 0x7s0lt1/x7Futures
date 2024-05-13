FROM node:lts-alpine as base

RUN npm i -g pnpm

FROM base as builder

WORKDIR /usr/src/app

COPY . .

RUN pnpm install --frozen-lockfile
RUN pnpm build

FROM base

WORKDIR /usr/src/app

COPY package.json pnpm-lock.yaml ./
COPY --from=builder /usr/src/app/dist ./src
COPY public /usr/src/app/public

RUN pnpm install -P --frozen-lockfile

EXPOSE 3388
VOLUME /usr/src/app/src
WORKDIR /usr/src/app/src
CMD [ "pnpm", "dev" ]
