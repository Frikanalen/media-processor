import { FfprobeData } from "fluent-ffmpeg";
import { urlFromObjectKey } from "./urlFromObjectKey";
const ffmpeg = require("fluent-ffmpeg");

export const metadataFromObject = async (objectKey: string): Promise<FfprobeData> => {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(
      urlFromObjectKey(objectKey),
      function (err: object | null, metadata: FfprobeData) {
        if (err) reject(err);
        resolve(metadata);
      }
    );
  });
};
