from jrottenberg/ffmpeg:4.1-alpine as ffmpeg-base

run apk add --update nodejs yarn

from ffmpeg-base as test-media-generator

copy . .

onbuild yarn build

cmd yarn start