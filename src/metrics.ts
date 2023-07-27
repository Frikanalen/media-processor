import { Queue } from "bullmq"
import type { VideoJobData } from "./video/types.js"
import { Gauge, register } from "prom-client"
import type { Middleware } from "koa"
import { log } from "./log.js"
import IORedis from "ioredis"
import { REDIS_URL } from "./config.js"
import Router from "@koa/router"
const connection = new IORedis(REDIS_URL)

const queue = new Queue<VideoJobData>("video-processing", { connection })

const getCounts = async () => {
  const { waiting, active, delayed, failed } = await queue.getJobCounts()
  if (!waiting || !active || !delayed || !failed) {
    throw new Error(`Failed to get job counts`)
  }
  const size = waiting + active + delayed + failed

  return {
    size,
    waiting,
    active,
    delayed,
    failed,
  }
}

const processQueueSizeTotal = new Gauge({
  name: "process_queue_size_total",
  help: "Total number of jobs in the processing queue",
  collect: async () => {
    const { size } = await getCounts()
    processQueueSizeTotal.set(size)
  },
})

const processQueuePending = new Gauge({
  name: "process_queue_pending",
  help: "Number of pending jobs in the processing queue",
  collect: async () => {
    const { waiting, delayed } = await getCounts()

    processQueuePending.set(waiting + delayed)
  },
})

const processQueueActive = new Gauge({
  name: "process_queue_active",
  help: "Number of active jobs in the processing queue",
  collect: async () => {
    const { active } = await getCounts()

    processQueueActive.set(active)
  },
})

const processQueueFailed = new Gauge({
  name: "process_queue_failed",
  help: "Number of failed jobs in the processing queue",
  collect: async () => {
    const { failed } = await getCounts()
    processQueueFailed.set(failed)
  },
})
export const sendPrometheusMetrics: Middleware = async (ctx, next) => {
  log.debug(`Giving metrics response`)
  ctx.set("Content-Type", register.contentType)
  ctx.body = register.metrics()
  return next()
}

const metricsRouter = new Router()
metricsRouter.get("/", sendPrometheusMetrics)
export { metricsRouter }
