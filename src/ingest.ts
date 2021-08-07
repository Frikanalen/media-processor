import {newVideoMessage} from "./jsonTypes";
import {FfprobeData} from "fluent-ffmpeg";
var mime = require('mime-types')

import {PrismaClient} from "@prisma/client";
import {getS3, putS3, deleteS3} from "./s3";
import {Asset, IngestJob, Video} from "./models";

import {Logger} from "tslog";
import * as fs from "fs";
const log: Logger = new Logger();

const Path = require("path");
const ffmpeg = require("fluent-ffmpeg");

const prisma = new PrismaClient({});

export const getOriginal = async (videoID: string, targetFile: string) => {
  const {location} = await prisma.asset.findFirst({
    where: {
      assetType: "original",
      videoID: videoID,
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

export const createThumbnail = async(videoID: string): Promise<void> => {
  log.info("Creating thumbnail");
  const video = new Video(videoID)
  const ingestJob = await IngestJob.create(videoID, 'createThumbnail')

  fs.mkdirSync(ingestJob.id)

  const inputFilename = 'thumbOrig'
  const outputFilename = 'thumbOut.jpg'



  await getOriginal(videoID, inputFilename)

  const finishUp = async() => {
    await putS3("thumbnail", videoID, outputFilename, 'image/jpeg');
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

export const createBroadcast = async(videoID: string): Promise<void> => {
  log.info("Creating broadcast asset");
  const ingestJob = await IngestJob.create(videoID, 'encodebroadcast')

  await getOriginal(videoID, 'broadcastOriginal')

  const finishUp = async() => {
    await putS3("broadcast", videoID, 'broadcastOutput.mov', 'video/quicktime');
    await Asset.create(videoID, 'broadcast', `broadcast/${videoID}`)
    await ingestJob.setState('Done')
  }

  return new Promise((resolve, reject) => {
    ffmpeg()
        .input('broadcastOriginal')
        .output('broadcastOutput.mov')
        .videoCodec('libx264')
        .outputOption('-crf 18')
        .audioCodec('pcm_s16le')
        .aspect("16:9")
        .keepDAR()
        .size("1280x720")
        .autopad(true)
        .on("end", () => finishUp().then(resolve))
        .on("progress", ({percent:p}: ffmpegProgress) => {p && ingestJob.setProgress(p).then()})
        .on("error", (e: Error) => {ingestJob.setState('Failed', e.message).then(()=>{throw e})})
        .run();

  });
};

export const createTheora = async(videoID: string): Promise<void> => {
  log.info("Creating theora asset");
  const ingestJob = await IngestJob.create(videoID, 'encodeTheora')

  await getOriginal(videoID, 'theoraOriginal')

  const finishUp = async() => {
    await putS3("theora", videoID, 'theoraOutput.ogv', 'video/ogg');
    await Asset.create(videoID, 'theora', `theora/${videoID}`)
    await ingestJob.setState('Done')
  }

  return new Promise((resolve, reject) => {
    ffmpeg()
      .input('theoraOriginal')
      .output('theoraOutput.ogv')
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
  videoID: string,
  origFile: string
): Promise<void> => {
  const ingestJob = await IngestJob.create(videoID, 'probeMetadata')

  try {
    const probeResults = await probeOriginal(origFile);

    await prisma.video.update({
      where: {
        id: videoID,
      },
      data: {
        mediaMetadata: {
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
  const { s3_key, video_id, orig_filename } = message;

  await prisma.asset.deleteMany();
  await prisma.ingestJob.deleteMany();
  await prisma.video.deleteMany();

  log.info("commencing ingest", { video_id });

  const { id: videoID } = await prisma.video.create({
    data: {
      legacyID: video_id,
    },
  });

  const originalFile = `original${Path.extname(orig_filename)}`;
  log.info(`downloading uploaded file to ${originalFile}`);

  await getS3("incoming", s3_key, originalFile);

  log.info(`probing metadata`);

  await extractMetadata(videoID, originalFile);

  log.info(`valid file, storing as original`);

  await putS3("original", videoID, originalFile, mime.lookup(originalFile));
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
  s3_key: "Saturday.Night.Live.S44E11.James.McAvoy.Meek.Mill.1080p.HULU.WEB-DL.AAC2.0.H.264-monkee.mp4",
});
