import { Queue, QueueEvents, Worker } from "bullmq"
import type { VideoJobData } from "./types.js"
import { process } from "./process.js"
import { log } from "../log"
import IORedis from "ioredis"
import { REDIS_URL } from "../config"

const connection = new IORedis(REDIS_URL)

const queue = new Queue<VideoJobData>("video-processing", {
  connection,
})

const events = new QueueEvents("video-processing", { connection })

new Worker("video-processing", process, {
  concurrency: 5,
  connection,
})

events.on("failed", ({ jobId, failedReason }) =>
  log.error(`Job ${jobId} failed`, failedReason),
)

export { queue as videoQueue }
