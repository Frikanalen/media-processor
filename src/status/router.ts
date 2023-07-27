import type { Context, Middleware } from "koa"
import { PassThrough } from "stream"
import Router from "@koa/router"
import { videoQueue } from "../video/queue.js"
import { statusMessageBroker, writeEvent } from "./broker.js"

const streamEventsMode = async (ctx: Context) => {
  ctx.request.socket.setTimeout(0)
  ctx.req.socket.setNoDelay(true)
  ctx.req.socket.setKeepAlive(true)

  ctx.respond = true
  ctx.status = 200

  ctx.response.body = new PassThrough()
  ctx.set({
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  })
  await ctx.flushHeaders()
}

/**
 * HTTP Event Stream showing the progress of the encoding job
 *
 */
export const statusUpdate: Middleware = async (ctx, next) => {
  const uploadId = ctx["params"].uploadId

  const job = await videoQueue.getJob(uploadId)

  if (!job) return ctx.throw(404, `job ${uploadId} not found`)

  // FIXME: No user permission checking!

  await streamEventsMode(ctx)

  writeEvent(ctx.response.body, {
    event: "status",
    data: {
      mediaId: job.data.mediaId,
      isCompleted: job.isCompleted(),
      isActive: job.isActive(),
      isFailed: job.isFailed(),
    },
  })

  statusMessageBroker.registerClient(uploadId, ctx.response.body)

  return next()
}

const jobStatusRouter = new Router()
jobStatusRouter.get("/:uploadId", statusUpdate)
jobStatusRouter.allowedMethods()
export { jobStatusRouter }
