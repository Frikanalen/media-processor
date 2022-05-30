from jrottenberg/ffmpeg:4.4-nvidia as ffmpeg-base

workdir /home/node 

RUN apt install -y curl
RUN curl -fsSL https://deb.nodesource.com/setup_16.x | bash -
RUN curl -sL https://dl.yarnpkg.com/debian/pubkey.gpg | gpg --dearmor | tee /usr/share/keyrings/yarnkey.gpg >/dev/null
RUN echo "deb [signed-by=/usr/share/keyrings/yarnkey.gpg] https://dl.yarnpkg.com/debian stable main" | tee /etc/apt/sources.list.d/yarn.list
RUN apt-get update && apt-get install yarn nodejs


# -------------

from ffmpeg-base as builder

copy package.json .
copy yarn.lock .

run yarn install --quiet --dev

copy . .

run yarn generate
run yarn build

run ls
run pwd

# -------------

from ffmpeg-base as deps

copy package.json .
copy yarn.lock .

run yarn install --quiet

# -------------
from ffmpeg-base

run ls

copy . .
copy --from=builder /home/node/build build 
copy --from=deps /home/node/node_modules node_modules
run ls
run pwd
run node --version

ENTRYPOINT ["/usr/bin/yarn"]

CMD ["run", "start"]
