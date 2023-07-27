import { Queue, QueueEvents, Worker } from "bullmq"
import type { VideoJob, VideoJobData } from "./types.js"
import { process } from "./process.js"
import { log } from "../log.js"
import IORedis from "ioredis"
import { REDIS_URL } from "../config.js"
import { statusMessageBroker } from "../status/broker.js"

const connection = new IORedis(REDIS_URL)

const queue = new Queue<VideoJobData>("video-processing", {
  connection,
})

const events = new QueueEvents("video-processing", { connection })

new Worker(
  "video-processing",
  async (job: VideoJob) => {
    try {
      return process(job)
    } catch (e) {
      log.error(e)
      throw e
    }
  },
  {
    concurrency: 5,
    connection,
  },
)

events.on("failed", ({ jobId, failedReason }) => {
  statusMessageBroker.broadcast(jobId, {
    event: "failed",
    data: { message: failedReason },
  })
  log.error(`Job ${jobId} failed:`, failedReason)
})

events.on("progress", ({ jobId, data }) => {
  statusMessageBroker.broadcast(jobId, {
    event: "progress",
    data: { percent: data },
  })
  log.info(`Job ${jobId} progress:`, data)
})

events.on("completed", ({ jobId }) => {
  statusMessageBroker.broadcast(jobId, {
    event: "completed",
    data: {},
  })
  log.info(`Job ${jobId} completed`)
})

export { queue as videoQueue }
