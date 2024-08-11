ARG PROJECT=api


FROM node:22.6-alpine AS base
RUN apk update && apk add --no-cache libc6-compat
RUN yarn global add turbo
RUN yarn global add pnpm


FROM base AS pruner
ARG PROJECT
WORKDIR /app
COPY . .
RUN turbo prune --scope=${PROJECT} --docker


FROM base AS builder
ARG PROJECT
WORKDIR /app
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=pruner /app/out/json/ .

RUN pnpm i
COPY --from=pruner /app/out/full/ .
RUN pnpm run build --filter=${PROJECT}

ENV NODE_ENV production
RUN pnpm install --prod


FROM base AS runner
ARG PROJECT
WORKDIR /app
COPY --from=builder /app .
WORKDIR /app/apps/${PROJECT}
ENV NODE_ENV=production

CMD ["pnpm", "run", "prod"]