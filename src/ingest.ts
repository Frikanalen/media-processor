import { newVideoMessage } from "./jsonTypes";
import { Logger } from "tslog";

const log: Logger = new Logger();
import { S3 } from "@aws-sdk/client-s3";
import * as fs from "fs";

const Path = require("path");
const ffmpeg = require("fluent-ffmpeg");
import { Readable } from "stream";
import { FfprobeData } from "fluent-ffmpeg";

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({});

type ffmpegProgress = {
  frames: number;
  currentFps: number;
  currentKbps: number;
  targetSize: number;
  timemark: string;
  percent?: number;
};

process.env["AWS_SECRET_ACCESS_KEY"] =
  "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY";
process.env["AWS_ACCESS_KEY_ID"] = "AKIAIOSFODNN7EXAMPLE";

const s3 = new S3({
  forcePathStyle: true,
  endpoint: "http://s3.fk.dev.local/",
  region: "no-where-1",
});

export const createTheora = async(videoID: string): Promise<void> => {
  log.info("Creating theora asset");

  const { location } = await prisma.asset.findFirst({
    where: {
      assetType: "original",
      videoID: videoID,
    },
  }) || {location: undefined};

  if (typeof location === 'undefined') {
    throw new Error("Original asset not available!")
  }

  const [ bucket, key ] = location.split('/')
  await getS3(bucket, key, 'theoraOriginal')

  return new Promise((resolve, reject) => {
    ffmpeg()
      .input('theoraOriginal')
      .output('theoraOutput.ogv')
      .on("end", resolve)
      .on("progress", (x: ffmpegProgress) => log.info(x))
      .on("error", reject)
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

const getS3 = async (
  bucket: string,
  key: string,
  targetFile: string
): Promise<void> => {
  const s3object = await s3.getObject({ Bucket: bucket, Key: key });
  const localFile = fs.createWriteStream(targetFile);

  if (!(s3object.Body instanceof Readable))
    throw new Error(`expected body type Readable, got ${typeof s3object.Body}`);

  s3object.Body.pipe(localFile);
};

const putS3 = async (
  bucket: string,
  key: string,
  sourceFile: string
): Promise<void> => {
  await s3.putObject({
    Body: fs.createReadStream(sourceFile),
    Bucket: bucket,
    Key: key,
  });
};

const deleteS3 = async (bucket: string, key: string): Promise<void> => {
  await s3.deleteObject({
    Bucket: bucket,
    Key: key,
  });
};

const extractMetadata = async (
  videoID: string,
  origFile: string
): Promise<void> => {
  const { id: jobID } = await prisma.ingestJob.create({
    data: {
      jobType: "probeMetadata",
      videoID: videoID,
    },
  });

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

    await prisma.ingestJob.update({
      where: { id: jobID },
      data: { state: "Done" },
    });
    log.debug("success", { jobID });
  } catch (error) {
    log.error("failure", { jobID });

    await prisma.ingestJob.update({
      where: { id: jobID },
      data: { state: "Failed", statusText: error.message },
    });

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

  await putS3("original", s3_key, originalFile);
  await prisma.asset.create({
    data: {
      videoID,
      assetType: "original",
      location: `original/${s3_key}`,
    },
  });
  await createTheora(videoID);
  // await deleteS3('incoming', s3_key)
  //await ingestOriginal(originalFile)
  //fs.writeFileSync('foo.mp4', foo.Body.read())
};

Ingest({
  version: 1,
  video_id: 2,
  orig_filename: "lol.mp4",
  s3_key: "874b3813ed36d242c55df7728d2bc644",
});
