FROM jrottenberg/ffmpeg:4.4-nvidia as ffmpeg-base

# To get apt to a working state we first have to delete the old nVidia CUDA key and apply the new one
RUN apt-key del 7fa2af80
RUN apt-get -o Acquire::AllowInsecureRepositories=true -o Acquire::AllowDowngradeToInsecureRepositories=true update
RUN apt-get -o APT::Get::AllowUnauthenticated=true install cuda-keyring
RUN rm /etc/apt/sources.list.d/cuda.list

RUN apt-get update && apt-get install -y curl
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
RUN curl -sL https://dl.yarnpkg.com/debian/pubkey.gpg | gpg --dearmor | tee /usr/share/keyrings/yarnkey.gpg >/dev/null
RUN echo "deb [signed-by=/usr/share/keyrings/yarnkey.gpg] https://dl.yarnpkg.com/debian stable main" | tee /etc/apt/sources.list.d/yarn.list
RUN apt-get update && apt-get install yarn nodejs

FROM ffmpeg-base as deps

WORKDIR /app

COPY package.json yarn.lock /app/

RUN yarn --quiet

FROM deps as builder

WORKDIR /app

COPY --from=deps /app/node_modules ./
COPY . .

RUN yarn generate
RUN yarn build

FROM ffmpeg-base
WORKDIR /app

COPY . .
COPY --from=builder /app/build build/
COPY --from=deps /app/node_modules node_modules/

ENTRYPOINT ["/usr/bin/yarn"]

CMD ["run", "start"]
