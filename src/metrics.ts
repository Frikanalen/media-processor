import Queue from "bull"
import type { VideoJobData } from "./video/types.js"
import { url } from "./upload/redis/connection.js"
import { Gauge, register } from "prom-client"
import type { Middleware } from "koa"
import { log } from "./log.js"

const queue = new Queue<VideoJobData>("video-processing", url)

const processQueueSizeTotal = new Gauge({
  name: "process_queue_size_total",
  help: "Total number of jobs in the processing queue",
  collect: async () => {
    const counts = await queue.getJobCounts()
    const size = counts.waiting + counts.active + counts.delayed
    processQueueSizeTotal.set(size)
  },
})

const processQueuePending = new Gauge({
  name: "process_queue_pending",
  help: "Number of pending jobs in the processing queue",
  collect: async () => {
    const counts = await queue.getJobCounts()
    processQueuePending.set(counts.waiting + counts.delayed)
  },
})

const processQueueActive = new Gauge({
  name: "process_queue_active",
  help: "Number of active jobs in the processing queue",
  collect: async () => {
    const counts = await queue.getJobCounts()
    processQueueActive.set(counts.active)
  },
})

const processQueueFailed = new Gauge({
  name: "process_queue_failed",
  help: "Number of failed jobs in the processing queue",
  collect: async () => {
    const counts = await queue.getJobCounts()
    processQueueFailed.set(counts.failed)
  },
})
export const showMetrics: Middleware = async (ctx, next) => {
  if (ctx.path !== "/metrics") await next()
  else {
    log.debug(`Giving metrics response`)
    ctx.set("Content-Type", register.contentType)
    ctx.body = register.metrics()
  }
}
