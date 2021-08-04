import {newVideoMessage} from "./jsonTypes";
import { Logger } from "tslog";
const log: Logger = new Logger();
import { S3 } from "@aws-sdk/client-s3";
import * as fs from "fs";
const Path = require("path")
const ffmpeg = require("fluent-ffmpeg");
import {testVideo} from "./ffmpeg";
import {Readable} from "stream";

process.env['AWS_SECRET_ACCESS_KEY'] = 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY'
process.env['AWS_ACCESS_KEY_ID'] = 'AKIAIOSFODNN7EXAMPLE'

const s3 = new S3({
    forcePathStyle: true,
    endpoint: 'http://s3.fk.dev.local/',
    region: 'no-where-1',
});

export const ingestOriginal = (inFile: string): Promise<void> => {
    log.info("processing ingest")

    return new Promise((resolve, reject) => {
        ffmpeg()
            .input(inFile)
            .output('processed.mp4')
            .on("end", resolve)
            .on("progress", (x) => log.info(x))
            .on("error", reject)
            .run();
    });
};

export const Ingest = async (newVideo: newVideoMessage) => {
    const { s3_key, video_id, orig_filename } = newVideo

    log.info("commencing ingest", {video_id})

    log.info("obtaining original", {s3_key})
    const foo = await s3.getObject({Bucket: 'incoming', Key: newVideo.s3_key});

    const origFile = `original${Path.extname(newVideo.orig_filename)}`
    log.info(`downloading file to ${origFile}`)

    const ws = fs.createWriteStream(origFile)
    if (!(foo.Body instanceof Readable)) {
        log.fatal(new Error(`expected body type Readable, got ${typeof foo.Body}`))
        return
    }

    foo.Body.pipe(ws)

    log.info("download done", {s3_key})
    await ingestOriginal(origFile)
    //fs.writeFileSync('foo.mp4', foo.Body.read())
}

