import {newVideoMessage} from "./jsonTypes";
import {FfprobeData} from "fluent-ffmpeg";
const mime = require('mime-types')

import {PrismaClient} from "@prisma/client";
import {getS3, putS3, deleteS3} from "./s3";
import {Asset, IngestJob, Video} from "./models";

import {Logger} from "tslog";
import * as fs from "fs";
const log: Logger = new Logger();

const Path = require("path");
const ffmpeg = require("fluent-ffmpeg");

const prisma = new PrismaClient({});

export const getOriginal = async (videoID: number, targetFile: string) => {
  const {location} = await prisma.fk_asset.findFirst({
    where: {
      asset_type: "original",
      video_id: videoID,
    },
  }) || {location: undefined};

  if (typeof location === 'undefined') {
    throw new Error("Original asset not available!")
  }

  const [bucket, key] = location.split('/')

  await getS3(bucket, key, targetFile)
}

type ffmpegProgress = {
  frames: number;
  currentFps: number;
  currentKbps: number;
  targetSize: number;
  timemark: string;
  percent?: number;
};

export const createThumbnail = async(videoID: number): Promise<void> => {
  log.info("Creating thumbnail");
  const video = new Video(videoID)
  const ingestJob = await IngestJob.create(videoID, 'createThumbnail')

  fs.mkdirSync(ingestJob.id.toString())

  const inputFilename = `${ingestJob.id}/thumbOrig`
  const outputFilename = `${ingestJob.id}/thumbOut.jpg`

  await getOriginal(videoID, inputFilename)

  const finishUp = async() => {
    await putS3("thumbnail", videoID.toString(), outputFilename, 'image/jpeg');
    await Asset.create(videoID, 'thumbnail', `thumbnail/${videoID}`)
    await ingestJob.setState('Done')
  }

  let thumbnailSeconds: number;

  try {
    const meta = await video.mediaMetadata
    thumbnailSeconds = Math.round(meta.format.duration * 0.25)
  } catch (e) {
    log.warn("Could not find original data length, assuming 30 seconds", {e})
    thumbnailSeconds = 30
  }

  return new Promise((resolve, reject) => {
    ffmpeg()
        .input(inputFilename)
        .output(outputFilename)
        .frames(1)
        .seekInput(thumbnailSeconds)
        .on("end", () => finishUp().then(resolve))
        .on("progress", ({percent:p}: ffmpegProgress) => {p && ingestJob.setProgress(p).then()})
        .on("error", (e: Error) => ingestJob.setState('Failed', e.message).then(reject))
        .run();
  });
};

export const createBroadcast = async(videoID: number): Promise<void> => {
  log.info("Creating broadcast asset");
  const ingestJob = await IngestJob.create(videoID, 'encodebroadcast')

  fs.mkdirSync(ingestJob.id.toString())

  const inputFilename = `${ingestJob.id}/broadcastOriginal`
  const outputFilename = `${ingestJob.id}/broadcastOutput.mov`

  await getOriginal(videoID, inputFilename)

  const finishUp = async() => {
    await putS3("broadcast", videoID.toString(), outputFilename, 'video/quicktime');
    await Asset.create(videoID, 'broadcast', `broadcast/${videoID}`)
    await ingestJob.setState('Done')
  }

  return new Promise((resolve, reject) => {
    ffmpeg()
        .input(inputFilename)
        .output(outputFilename)
        .videoCodec('libx264')
        .outputOption('-crf 18')
        .audioCodec('pcm_s16le')
        .aspect("16:9")
        .keepDAR()
        .size("1280x720")
        .autopad(true)
        .on("end", () => finishUp().then(resolve))
        .on("progress", ({percent:p}: ffmpegProgress) => {p && ingestJob.setProgress(p).then()})
        .on("error", (e: Error) => {ingestJob.setState('Failed', e.message).then(()=>{reject(e)})})
        .run();

  });
};

export const createTheora = async(videoID: number): Promise<void> => {
  log.info("Creating theora asset");
  const ingestJob = await IngestJob.create(videoID, 'encodeTheora')

  fs.mkdirSync(ingestJob.id.toString())

  const inputFilename = `${ingestJob.id}/theoraOriginal`
  const outputFilename = `${ingestJob.id}/broadcastOutput.mov`

  await getOriginal(videoID, inputFilename)

  const finishUp = async() => {
    await putS3("theora", videoID.toString(), outputFilename, 'video/ogg');
    await Asset.create(videoID, 'theora', `theora/${videoID}`)
    await ingestJob.setState('Done')
  }

  return new Promise((resolve, reject) => {
    ffmpeg()
      .input(inputFilename)
      .output(outputFilename)
      .outputOptions(['-qscale:v 7', '-qscale:a 2'])
      .aspect("16:9")
      .size("720x?")
      .autopad(true)
      .on("end", () => finishUp().then(resolve))
      .on("progress", ({percent:p}: ffmpegProgress) => {p && ingestJob.setProgress(p).then()})
      .on("error", (e: Error) => ingestJob.setState('Failed', e.message).then(reject))
      .run();
  });
};

export const probeOriginal = async (inFile: string): Promise<object> => {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(
      inFile,
      function (err: object | null, metadata: FfprobeData) {
        if (err) reject(err);
        resolve(metadata);
      }
    );
  });
};

const extractMetadata = async (
  videoID: number,
  origFile: string
): Promise<void> => {
  const ingestJob = await IngestJob.create(videoID, 'probeMetadata')

  try {
    const probeResults = await probeOriginal(origFile);

    await prisma.fk_video.update({
      where: {
        id: videoID,
      },
      data: {
        media_metadata: {
          version: 1,
          data: probeResults,
        },
      },
    });

    await ingestJob.setState('Done')
    log.debug("success", { id: ingestJob.id });
  } catch (error) {
    await ingestJob.setState('Failed', error.message)
    log.error("failure", { id: ingestJob.id });
    throw error;
  }
};

export const Ingest = async (message: newVideoMessage) => {
  const { s3_key, video_id: videoID, orig_filename } = message;

  log.info("commencing ingest", { videoID });

  const originalFile = `original${Path.extname(orig_filename)}`;
  log.info(`downloading uploaded file to ${originalFile}`);

  await getS3("incoming", s3_key, originalFile);

  log.info(`probing metadata`);

  await extractMetadata(videoID, originalFile);

  log.info(`valid file, storing as original`);

  await putS3("original", videoID.toString(), originalFile, mime.lookup(originalFile));
  await Asset.create(videoID, 'original', `original/${videoID}`)

  await createTheora(videoID);
  await createThumbnail(videoID);
  await createBroadcast(videoID);
  await deleteS3('incoming', s3_key)
  //await ingestOriginal(originalFile)
  //fs.writeFileSync('foo.mp4', foo.Body.read())
};

Ingest({
  version: 1,
  video_id: 2,
  orig_filename: "lol.mp4",
  s3_key: "4e3e14794d471dd6e72f512be2df0ac7",
});
